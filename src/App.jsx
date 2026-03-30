import { useState, useEffect, useCallback } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell
} from "recharts";

/* ─── FONTS ──────────────────────────────────────────────────────────────── */
(() => {
  const l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,300;0,400;0,600;0,700;0,800;0,900;1,700&family=Barlow:wght@300;400;500;600&family=Roboto+Mono:wght@300;400;500&display=swap";
  document.head.appendChild(l);

  const s = document.createElement("style");
  s.textContent = `
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html,body{background:#0a0a0a;color:#f0ede8;font-family:'Barlow',sans-serif;overflow-x:hidden}
    input[type=number]::-webkit-inner-spin-button,
    input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none}
    input[type=number]{-moz-appearance:textfield}
    select option{background:#141414;color:#f0ede8}
    ::-webkit-scrollbar{width:3px}
    ::-webkit-scrollbar-thumb{background:#ff5a1f50;border-radius:2px}
    @keyframes fadeUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes scanline{0%{transform:translateY(-100%)}100%{transform:translateY(600px)}}
    @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
    @keyframes slideX{from{opacity:0;transform:translateX(-24px)}to{opacity:1;transform:translateX(0)}}
    @keyframes countUp{from{opacity:0;transform:scale(.8)}to{opacity:1;transform:scale(1)}}
    .anim-page{animation:fadeUp .5s cubic-bezier(.22,1,.36,1) both}
    .anim-step{animation:slideX .38s cubic-bezier(.22,1,.36,1) both}
    .anim-count{animation:countUp .6s cubic-bezier(.22,1,.36,1) both}
    .cursor{animation:blink 1s step-end infinite}
  `;
  document.head.appendChild(s);
})();

/* ─── TOKENS ─────────────────────────────────────────────────────────────── */
const K = {
  bg:   "#0a0a0a", s1: "#111111", s2: "#181818", s3: "#1f1f1f", s4: "#282828",
  b1:   "#2a2a2a", b2: "#383838", b3: "#4a4a4a",
  ora:  "#ff5a1f", oraDim: "#cc3d0c", oraBg: "rgba(255,90,31,.08)",
  grn:  "#39d98a", grnBg: "rgba(57,217,138,.08)",
  red:  "#ff4560", redBg: "rgba(255,69,96,.08)",
  yel:  "#f5c842", yelBg: "rgba(245,200,66,.08)",
  blu:  "#4da6ff", bluBg: "rgba(77,166,255,.08)",
  txt:  "#f0ede8", dim:   "#8a8680", mut:  "#484440",
};

/* ─── DEMOS ──────────────────────────────────────────────────────────────── */
const DEMOS = {
  "alex@irontrack.io": {
    pw:"alex123", name:"Alex Carter", av:"AC",
    profile:{
      age:"28",gender:"male",height:"178",weight:"82",bodyfat:"20",medical:"None",
      occupation:"desk",activityLevel:"moderate",experience:"intermediate",goal:"muscle_gain",
      workoutDays:"4",calories:"2200",protein:"140",carbs:"240",fats:"65",sleep:"7",trainingType:"strength",
    }
  },
  "demo@fit.com":{
    pw:"demo123", name:"Demo User", av:"DU",
    profile:{
      age:"25",gender:"female",height:"163",weight:"62",bodyfat:"24",medical:"None",
      occupation:"mixed",activityLevel:"light",experience:"beginner",goal:"fat_loss",
      workoutDays:"3",calories:"1700",protein:"110",carbs:"190",fats:"55",sleep:"6",trainingType:"mixed",
    }
  },
};

/* ─── FORMULAS ───────────────────────────────────────────────────────────── */
const calcBMI  = (w,h) => +(w / ((h/100)**2)).toFixed(1);
const bmiInfo  = b => b<18.5?["Underweight",K.blu]:b<25?["Normal",K.grn]:b<30?["Overweight",K.yel]:["Obese",K.red];
const calcBMR  = (w,h,a,g) => g==="male" ? 10*w+6.25*h-5*a+5 : 10*w+6.25*h-5*a-161;
const AMULT    = {sedentary:1.2,light:1.375,moderate:1.55,active:1.725,athlete:1.9};
const calcTDEE = (bmr,al) => Math.round(bmr*(AMULT[al]||1.2));
const calcIdeal= (h,g) => {
  const hIn=h/2.54, ov=Math.max(0,hIn-60);
  const r = g==="male" ? 52+1.9*ov : 49+1.7*ov;
  const d = g==="male" ? 50+2.3*ov : 45.5+2.3*ov;
  return {min:+Math.min(r,d).toFixed(1), max:+Math.max(r,d).toFixed(1)};
};

/* ─── BULLETPROOF INPUT PRIMITIVES ──────────────────────────────────────── */
// KEY PRINCIPLE: type="text"+inputMode="numeric" prevents ALL one-digit bugs.
// State is ALWAYS a raw string. Never parseInt/Number during onChange.

const useInput = (focused) => ({
  border: `1px solid ${focused ? K.ora : K.b1}`,
  boxShadow: focused ? `0 0 0 3px ${K.ora}20` : "none",
  outline: "none",
  transition: "border-color .15s, box-shadow .15s",
});

const NumIn = ({ value, onChange, placeholder, disabled }) => {
  const [f, sf] = useState(false);
  const inp = useInput(f);
  return (
    <input
      type="text" inputMode="numeric" pattern="[0-9]*"
      value={value} placeholder={placeholder} disabled={disabled}
      onChange={e => onChange(e.target.value.replace(/[^0-9]/g,""))}
      onFocus={()=>sf(true)} onBlur={()=>sf(false)}
      style={{
        ...inp, width:"100%", background:K.s3, color:K.txt,
        borderRadius:6, padding:"11px 13px",
        fontFamily:"'Roboto Mono',monospace", fontSize:14, fontWeight:400,
      }}
    />
  );
};

const TxtIn = ({ value, onChange, placeholder, type="text", disabled }) => {
  const [f, sf] = useState(false);
  const inp = useInput(f);
  return (
    <input
      type={type} value={value} placeholder={placeholder} disabled={disabled}
      onChange={e => onChange(e.target.value)}
      onFocus={()=>sf(true)} onBlur={()=>sf(false)}
      style={{
        ...inp, width:"100%", background:K.s3, color:K.txt,
        borderRadius:6, padding:"11px 13px",
        fontFamily:"'Barlow',sans-serif", fontSize:14, fontWeight:400,
      }}
    />
  );
};

const Sel = ({ value, onChange, opts }) => {
  const [f, sf] = useState(false);
  const inp = useInput(f);
  return (
    <select
      value={value} onChange={e=>onChange(e.target.value)}
      onFocus={()=>sf(true)} onBlur={()=>sf(false)}
      style={{
        ...inp, width:"100%", background:K.s3, color:K.txt,
        borderRadius:6, padding:"11px 13px",
        fontFamily:"'Barlow',sans-serif", fontSize:14, cursor:"pointer",
        appearance:"none",
        backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%238a8680' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
        backgroundRepeat:"no-repeat", backgroundPosition:"right 13px center", paddingRight:34,
      }}
    >
      {opts.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
    </select>
  );
};

/* ─── SHARED UI ──────────────────────────────────────────────────────────── */
const Row  = ({children,style={}}) => <div style={{display:"flex",flexDirection:"column",gap:6,width:"100%",...style}}>{children}</div>;
const Grid = ({cols="1fr 1fr",gap=12,children,style={}}) => <div style={{display:"grid",gridTemplateColumns:cols,gap,...style}}>{children}</div>;

const Mono = ({children,size=10,color=K.mut,style={}}) => (
  <span style={{fontFamily:"'Roboto Mono',monospace",fontSize:size,color,letterSpacing:.8,...style}}>{children}</span>
);

const Label = ({children,color=K.mut}) => (
  <div style={{fontFamily:"'Roboto Mono',monospace",fontSize:10,color,textTransform:"uppercase",
    letterSpacing:1.8,marginBottom:6}}>{children}</div>
);

const Fld = ({label,hint,error,children}) => (
  <Row>
    {label&&<Label color={error?K.red:K.mut}>{label}</Label>}
    {children}
    {hint&&!error&&<Mono size={10} color={K.mut}>{hint}</Mono>}
    {error&&<span style={{fontFamily:"'Barlow',sans-serif",fontSize:11,color:K.red}}>⚠ {error}</span>}
  </Row>
);

const Card = ({children,style={},accent=false,glowColor}) => (
  <div style={{
    background:K.s1, border:`1px solid ${accent?K.ora+"60":K.b1}`,
    borderRadius:8, padding:20, position:"relative", overflow:"hidden",
    ...(glowColor?{boxShadow:`0 0 40px ${glowColor}15`}:{}),
    ...style,
  }}>
    {accent&&<div style={{position:"absolute",top:0,left:0,right:0,height:2,
      background:`linear-gradient(90deg,transparent,${K.ora},transparent)`}}/>}
    {children}
  </div>
);

const Btn = ({children,onClick,v="pri",loading,disabled,style:s={}}) => {
  const V = {
    pri:{bg:K.ora,color:"#0a0a0a",border:"none"},
    out:{bg:"transparent",color:K.ora,border:`1px solid ${K.ora}`},
    gst:{bg:K.s3,color:K.dim,border:`1px solid ${K.b1}`},
    red:{bg:K.red,color:"#fff",border:"none"},
  };
  return (
    <button type="button" onClick={onClick} disabled={loading||disabled} style={{
      ...V[v], borderRadius:6, padding:"11px 20px",
      fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:15, letterSpacing:.8,
      cursor:(loading||disabled)?"not-allowed":"pointer", opacity:disabled?.45:1,
      transition:"all .15s", display:"inline-flex", alignItems:"center",
      justifyContent:"center", gap:8, ...s,
    }}>
      {loading&&<span style={{width:13,height:13,border:"2px solid #0a0a0a40",borderTopColor:"#0a0a0a",
        borderRadius:"50%",animation:"spin .7s linear infinite",display:"inline-block"}}/>}
      {children}
    </button>
  );
};

const Pill = ({children,color=K.ora,style={}}) => (
  <span style={{fontFamily:"'Roboto Mono',monospace",fontSize:10,padding:"3px 9px",borderRadius:999,
    background:color+"20",color,border:`1px solid ${color}35`,letterSpacing:.6,...style}}>
    {children}
  </span>
);

const Alert = ({color=K.ora,tag,children,style={}}) => (
  <div style={{padding:"12px 15px",background:color+"0d",border:`1px solid ${color}30`,borderRadius:7,...style}}>
    {tag&&<Mono size={9} color={color} style={{textTransform:"uppercase",letterSpacing:1.6,display:"block",marginBottom:5}}>{tag}</Mono>}
    <div style={{fontFamily:"'Barlow',sans-serif",fontSize:12,color:K.dim,lineHeight:1.7}}>{children}</div>
  </div>
);

const StatBox = ({label,value,unit,sub,color=K.ora,style={}}) => (
  <div style={{background:K.s2,border:`1px solid ${K.b1}`,borderRadius:7,padding:"15px 14px",...style}}>
    <Mono size={9} color={K.mut} style={{textTransform:"uppercase",letterSpacing:1.6,display:"block",marginBottom:6}}>{label}</Mono>
    <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:34,fontWeight:800,color,lineHeight:1}}>{value}</div>
    {unit&&<Mono size={10} color={K.mut} style={{display:"block",marginTop:3}}>{unit}</Mono>}
    {sub&&<div style={{fontFamily:"'Barlow',sans-serif",fontSize:11,color:K.dim,marginTop:4}}>{sub}</div>}
  </div>
);

const IcnBtn = ({icon,label,sub,active,onClick,color=K.ora}) => (
  <button type="button" onClick={onClick} style={{
    padding:"13px 8px",borderRadius:7,cursor:"pointer",textAlign:"center",
    background:active?color+"10":K.s3, border:`1px solid ${active?color:K.b1}`,
    transition:"all .15s", outline:"none",
    display:"flex",flexDirection:"column",alignItems:"center",gap:5,
  }}>
    <span style={{fontSize:20}}>{icon}</span>
    <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:13,
      color:active?color:K.txt,letterSpacing:.4}}>{label}</span>
    {sub&&<Mono size={9} color={K.mut}>{sub}</Mono>}
  </button>
);

/* ─── AI SYSTEM PROMPT ──────────────────────────────────────────────────── */
const AI_SYSTEM = `You are a certified fitness performance analyst, nutrition planner, and lifestyle strategist. You must calculate accurately, use evidence-based formulas, avoid unrealistic promises, and adapt recommendations by user type: sedentary office worker, beginner, intermediate, advanced athlete.

CALCULATIONS YOU MUST DO:
1. BMI = weight / (height_m)² → <18.5 Underweight, 18.5-24.9 Normal, 25-29.9 Overweight, 30+ Obese
2. Ideal Weight (GIVE A RANGE, NOT A SINGLE NUMBER):
   - Robinson (1983): Male 52+1.9*(inches_over_5ft), Female 49+1.7*(inches_over_5ft)
   - Devine (1974): Male 50+2.3*(inches_over_5ft), Female 45.5+2.3*(inches_over_5ft)
   - Report min–max range and kg difference from current weight
3. BMR (Mifflin-St Jeor): Male: (10×wt)+(6.25×ht)−(5×age)+5 | Female: (10×wt)+(6.25×ht)−(5×age)−161
4. TDEE: Sedentary×1.2, Light×1.375, Moderate×1.55, Active×1.725, Athlete×1.9
5. Compare calorie intake vs TDEE

GOAL ALIGNMENT:
- Fat loss: 300–500 kcal deficit, protein 1.6–2.2g/kg
- Muscle gain: 200–400 kcal surplus, protein 1.8–2.4g/kg
- Maintenance: ±100 kcal, balanced macros

DESK JOB SPECIAL RULES (occupation=desk):
- Warn about sitting risks >8 hrs
- Give NEAT tips, 30–45 min workout plan only
- Step target 7000–9000/day
- Focus on sustainability, stress mgmt, sleep

EXPERIENCE PERSONALIZATION:
- Beginner: consistency, 3-4 days, full body, form first
- Intermediate: progressive overload, split routines, volume
- Advanced: macro precision, deload, recovery metrics, body fat tracking

SAFETY:
- BMI>35: recommend doctor
- Calories <1200 or >4500: flag warning
- Sleep <5hrs: prioritize recovery
- No medical prescriptions, no rapid transformation promises

FINAL EXPERT REMARK — for the "expertRemark" field:
Write a short, strong summary covering exactly three things:
1. Their current situation — a clear, honest snapshot of where they stand right now.
2. The key correction needed — the single most impactful change they must make.
3. One powerful improvement step — one specific, actionable thing they can start immediately.

🛑 IMPORTANT RULES FOR AI:
- Do NOT overpromise results or guarantee specific outcomes.
- Do NOT give medical advice or diagnose any condition.
- Do NOT assume unknown values — if body fat % is missing, explicitly mention it in the remark.
- If calorie intake is <1200 or >4500 kcal, flag it as a concern in the remark.
- Keep tone professional, direct, and evidence-based.

RESPOND ONLY WITH THIS EXACT JSON (no markdown, no preamble):
{
  "bmi": number,
  "bmiCategory": string,
  "idealMin": number,
  "idealMax": number,
  "weightDiff": string,
  "bmr": number,
  "tdee": number,
  "calorieStatus": "Deficit"|"Surplus"|"On Target",
  "calorieGap": number,
  "onTrack": boolean,
  "profileSummary": {"age":string,"occupation":string,"experience":string,"goal":string},
  "lifestyleRisk": {"sitting":string,"stress":string,"sleep":string},
  "goalSummary": string,
  "whatWorking": string,
  "whatMisaligned": string,
  "remarks": [string,string,string,string],
  "actionPlan": {
    "dailyCalories":string,"proteinTarget":string,"workoutFrequency":string,
    "cardio":string,"stepGoal":string,"sleep":string,"habitFocus":string
  },
  "timeline": string,
  "expertRemark": string,
  "score": number,
  "doubts": [
    {"q":"Can I lose fat without gym?","a":string},
    {"q":"Is rice bad for fitness?","a":string},
    {"q":"How much protein is too much?","a":string},
    {"q":"Do I need supplements?","a":string},
    {"q":"Can I build muscle at home?","a":string},
    {"q":"How important is sleep for results?","a":string}
  ]
}`;

/* ═══════════════════════════════════════════════════════════════════════════
   LOGIN
═══════════════════════════════════════════════════════════════════════════ */
const Login = ({ onLogin }) => {
  const [mode, setMode]     = useState("login");
  const [email, setEmail]   = useState("");
  const [pw, setPw]         = useState("");
  const [name, setName]     = useState("");
  const [err, setErr]       = useState("");
  const [loading, setLoad]  = useState(false);
  const [accounts, setAcc]  = useState({ ...DEMOS });
  const [showPw, setShowPw] = useState(false);

  const submit = async () => {
    setErr("");
    if (!email.includes("@"))    { setErr("Enter a valid email address."); return; }
    if (pw.length < 6)           { setErr("Password must be at least 6 characters."); return; }
    setLoad(true);
    await new Promise(r => setTimeout(r, 720));

    if (mode === "signup") {
      if (!name.trim())            { setErr("Enter your full name."); setLoad(false); return; }
      if (accounts[email])         { setErr("Account exists. Please sign in."); setLoad(false); return; }
      const av = name.trim().split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2);
      setAcc(p=>({...p,[email]:{pw,name:name.trim(),av}}));
      onLogin({ email, name:name.trim(), av, isNew:true });
    } else {
      const u = accounts[email];
      if (!u || u.pw !== pw)      { setErr("Incorrect email or password."); setLoad(false); return; }
      onLogin({ email, name:u.name, av:u.av, profile:u.profile||null });
    }
    setLoad(false);
  };

  return (
    <div className="anim-page" style={{
      minHeight:"100vh", background:K.bg,
      display:"flex", alignItems:"center", justifyContent:"center",
      padding:24, position:"relative", overflow:"hidden",
    }}>
      {/* Grid BG */}
      <div style={{position:"absolute",inset:0,
        backgroundImage:`linear-gradient(${K.b1}70 1px,transparent 1px),linear-gradient(90deg,${K.b1}70 1px,transparent 1px)`,
        backgroundSize:"50px 50px",pointerEvents:"none",opacity:.6}}/>
      {/* Glow blobs */}
      <div style={{position:"absolute",top:"-10%",right:"-8%",width:500,height:500,borderRadius:"50%",
        background:`radial-gradient(${K.ora}18 0%,transparent 60%)`,pointerEvents:"none"}}/>
      <div style={{position:"absolute",bottom:"-15%",left:"-5%",width:400,height:400,borderRadius:"50%",
        background:`radial-gradient(${K.blu}10 0%,transparent 60%)`,pointerEvents:"none"}}/>

      <div style={{width:"100%",maxWidth:420,position:"relative",zIndex:1}}>
        {/* Brand */}
        <div style={{textAlign:"center",marginBottom:42}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:12,marginBottom:10}}>
            <div style={{
              width:46,height:46,borderRadius:10,border:`2px solid ${K.ora}`,
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,
              background:K.oraBg,
            }}>⚡</div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:40,fontWeight:900,
              color:K.txt,letterSpacing:3,lineHeight:1}}>
              IRON<span style={{color:K.ora}}>TRACK</span>
            </div>
          </div>
          <Mono size={11} color={K.mut} style={{letterSpacing:2.5}}>AI FITNESS PERFORMANCE SYSTEM v2.0</Mono>
        </div>

        <Card style={{padding:32}}>
          {/* Mode toggle */}
          <div style={{display:"flex",background:K.s2,borderRadius:7,padding:4,marginBottom:26}}>
            {[["login","SIGN IN"],["signup","CREATE ACCOUNT"]].map(([m,lbl])=>(
              <button key={m} type="button" onClick={()=>{setMode(m);setErr("");}} style={{
                flex:1,padding:"10px 8px",
                background:mode===m?K.ora:"transparent",
                color:mode===m?"#0a0a0a":K.dim,
                border:"none",borderRadius:5,cursor:"pointer",
                fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,
                fontSize:13,letterSpacing:.8,transition:"all .15s",
              }}>{lbl}</button>
            ))}
          </div>

          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            {mode==="signup"&&(
              <Fld label="Full Name">
                <TxtIn value={name} onChange={setName} placeholder="e.g. Alex Carter"/>
              </Fld>
            )}
            <Fld label="Email Address">
              <TxtIn value={email} onChange={setEmail} placeholder="you@example.com" type="email"/>
            </Fld>
            <Fld label="Password" error={err}>
              <div style={{position:"relative"}}>
                <TxtIn value={pw} onChange={setPw} placeholder="Min. 6 characters" type={showPw?"text":"password"}/>
                <button type="button" onClick={()=>setShowPw(s=>!s)} style={{
                  position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",
                  background:"none",border:"none",cursor:"pointer",
                  fontFamily:"'Roboto Mono',monospace",fontSize:9,color:K.dim,letterSpacing:1,
                }}>{showPw?"HIDE":"SHOW"}</button>
              </div>
            </Fld>
          </div>

          <Btn onClick={submit} loading={loading} style={{width:"100%",marginTop:20,padding:14,fontSize:15}}>
            {mode==="login"?"⚡ SIGN IN":"🚀 CREATE ACCOUNT"}
          </Btn>

          {mode==="login"&&(
            <Alert color={K.ora} tag="Demo Credentials" style={{marginTop:16}}>
              <div style={{marginTop:6,display:"flex",flexDirection:"column",gap:3}}>
                <Mono size={11} color={K.dim}>📧 alex@irontrack.io / alex123</Mono>
                <Mono size={11} color={K.dim}>📧 demo@fit.com / demo123</Mono>
              </div>
            </Alert>
          )}
        </Card>

        {/* Decorative line */}
        <div style={{display:"flex",alignItems:"center",gap:12,marginTop:22,justifyContent:"center"}}>
          <div style={{height:1,width:60,background:K.b2}}/>
          <Mono size={9} color={K.mut}>SECURE · PRIVATE · NO ADS</Mono>
          <div style={{height:1,width:60,background:K.b2}}/>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   ONBOARDING
═══════════════════════════════════════════════════════════════════════════ */
const OB_STEPS = [
  {id:"body",   lbl:"Body Stats",    ic:"📏"},
  {id:"work",   lbl:"Work & Life",   ic:"💼"},
  {id:"level",  lbl:"Training",      ic:"🏋️"},
  {id:"macros", lbl:"Nutrition",     ic:"🥗"},
  {id:"life",   lbl:"Lifestyle",     ic:"💤"},
];

const Onboarding = ({ user, onComplete }) => {
  const [step, setStep] = useState(0);
  const [d, setD] = useState({
    age:"",gender:"male",height:"",weight:"",bodyfat:"",medical:"",
    occupation:"desk",activityLevel:"sedentary",
    experience:"beginner",goal:"fat_loss",workoutDays:"",
    calories:"",protein:"",carbs:"",fats:"",
    sleep:"7",trainingType:"strength",
  });
  const set = useCallback((k,v) => setD(p=>({...p,[k]:v})),[]);

  const bmi   = d.weight&&d.height ? calcBMI(+d.weight,+d.height) : null;
  const bInfo = bmi ? bmiInfo(bmi) : null;
  const ideal = d.height&&d.gender ? calcIdeal(+d.height,d.gender) : null;
  const wDiff = ideal&&d.weight ? (+d.weight - ideal.max).toFixed(1) : null;
  const mSum  = d.protein&&d.carbs&&d.fats
    ? (+d.protein)*4+(+d.carbs)*4+(+d.fats)*9 : null;

  const canNext = () => {
    if(step===0) return d.age&&d.height&&d.weight;
    if(step===2) return d.workoutDays;
    if(step===3) return d.calories&&d.protein;
    return true;
  };

  const pages = [
    /* 0 — Body */
    <div key="body" className="anim-step" style={{display:"flex",flexDirection:"column",gap:14}}>
      <Grid>
        <Fld label="Age (years)"><NumIn value={d.age} onChange={v=>set("age",v)} placeholder="28"/></Fld>
        <Fld label="Gender"><Sel value={d.gender} onChange={v=>set("gender",v)} opts={[{v:"male",l:"Male"},{v:"female",l:"Female"}]}/></Fld>
      </Grid>
      <Grid>
        <Fld label="Height (cm)"><NumIn value={d.height} onChange={v=>set("height",v)} placeholder="175"/></Fld>
        <Fld label="Weight (kg)"><NumIn value={d.weight} onChange={v=>set("weight",v)} placeholder="80"/></Fld>
      </Grid>
      <Fld label="Body Fat % (optional)" hint="// leave blank — AI estimates from BMI">
        <NumIn value={d.bodyfat} onChange={v=>set("bodyfat",v)} placeholder="e.g. 18"/>
      </Fld>
      <Fld label="Medical Conditions (optional)">
        <TxtIn value={d.medical} onChange={v=>set("medical",v)} placeholder="Hypertension, Diabetes, None…"/>
      </Fld>

      {bmi&&bInfo&&ideal&&(
        <div className="anim-count" style={{
          padding:"16px 18px",background:bInfo[1]+"0e",border:`1px solid ${bInfo[1]}30`,
          borderRadius:8,display:"flex",justifyContent:"space-between",alignItems:"center",
        }}>
          <div>
            <Mono size={9} color={K.mut} style={{textTransform:"uppercase",letterSpacing:1.6,display:"block",marginBottom:4}}>
              LIVE BMI PREVIEW
            </Mono>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:50,fontWeight:900,
              color:bInfo[1],lineHeight:1}}>{bmi}</div>
            <Mono size={10} color={K.dim} style={{display:"block",marginTop:4}}>
              Ideal: {ideal.min}–{ideal.max} kg
              {wDiff&&<> · {wDiff>0?`${wDiff}kg above`:wDiff<0?`${Math.abs(wDiff)}kg below`:"at ideal"}</>}
            </Mono>
          </div>
          <Pill color={bInfo[1]}>{bInfo[0].toUpperCase()}</Pill>
        </div>
      )}
    </div>,

    /* 1 — Work */
    <div key="work" className="anim-step" style={{display:"flex",flexDirection:"column",gap:14}}>
      <Fld label="Occupation Type">
        <Grid cols="1fr 1fr 1fr" gap={10}>
          {[["desk","💻","Desk Job","9–5 sitting"],["mixed","🔄","Mixed","Sit + move"],["physical","🦺","Physical","Active job"]].map(([v,ic,lb,sub])=>(
            <IcnBtn key={v} icon={ic} label={lb} sub={sub} active={d.occupation===v} onClick={()=>set("occupation",v)}/>
          ))}
        </Grid>
      </Fld>
      <Fld label="Activity Level">
        <Sel value={d.activityLevel} onChange={v=>set("activityLevel",v)} opts={[
          {v:"sedentary",l:"Sedentary — No exercise"},{v:"light",l:"Light — 1–3×/week"},
          {v:"moderate",l:"Moderate — 3–5×/week"},{v:"active",l:"Active — 6–7×/week"},{v:"athlete",l:"Athlete — 2×/day"},
        ]}/>
      </Fld>
      {d.occupation==="desk"&&(
        <Alert color={K.yel} tag="⚠ DESK PROFESSIONAL DETECTED">
          You'll receive specialized guidance: NEAT improvement strategies, efficient 30–45 min workouts, 7000–9000 step targets, stress and sleep optimization. No extreme diets.
        </Alert>
      )}
    </div>,

    /* 2 — Level */
    <div key="level" className="anim-step" style={{display:"flex",flexDirection:"column",gap:14}}>
      <Fld label="Workout Experience">
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {[
            ["none","🧑‍💻","None / Sedentary","Never or rarely exercised"],
            ["beginner","🌱","Beginner","< 1 year consistent training"],
            ["intermediate","📈","Intermediate","1–3 years of training"],
            ["advanced","🏆","Advanced Athlete","3+ years, structured program"],
          ].map(([v,ic,lb,sub])=>(
            <button key={v} type="button" onClick={()=>set("experience",v)} style={{
              display:"flex",alignItems:"center",gap:12,padding:"11px 14px",
              borderRadius:7,cursor:"pointer",textAlign:"left",
              background:d.experience===v?K.oraBg:K.s3,
              border:`1px solid ${d.experience===v?K.ora:K.b1}`,
              transition:"all .15s",outline:"none",
            }}>
              <span style={{fontSize:18,flexShrink:0}}>{ic}</span>
              <div style={{flex:1}}>
                <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:14,
                  color:d.experience===v?K.ora:K.txt,letterSpacing:.3}}>{lb}</div>
                <Mono size={10} color={K.mut}>{sub}</Mono>
              </div>
              {d.experience===v&&<span style={{color:K.ora,fontSize:14,flexShrink:0}}>✓</span>}
            </button>
          ))}
        </div>
      </Fld>
      <Fld label="Primary Goal">
        <Grid cols="1fr 1fr" gap={8}>
          {[["fat_loss","🔥","FAT LOSS"],["muscle_gain","💪","MUSCLE GAIN"],["maintenance","⚖️","MAINTENANCE"],["performance","🚀","PERFORMANCE"]].map(([v,ic,lb])=>(
            <IcnBtn key={v} icon={ic} label={lb} active={d.goal===v} onClick={()=>set("goal",v)} color={K.blu}/>
          ))}
        </Grid>
      </Fld>
      <Fld label="Workout Days Per Week" hint="// enter 1–7">
        <NumIn value={d.workoutDays} onChange={v=>set("workoutDays",v)} placeholder="e.g. 4"/>
      </Fld>
    </div>,

    /* 3 — Macros */
    <div key="macros" className="anim-step" style={{display:"flex",flexDirection:"column",gap:14}}>
      <Alert color={K.grn} tag="// ACCURACY MATTERS">
        Enter your <strong style={{color:K.txt}}>actual current daily intake</strong>, not your target. Be honest — the AI identifies real gaps and makes precise corrections.
      </Alert>
      <Fld label="Daily Calories (kcal)">
        <NumIn value={d.calories} onChange={v=>set("calories",v)} placeholder="e.g. 2000"/>
      </Fld>
      {d.calories&&(+d.calories<1200||+d.calories>4500)&&(
        <Alert color={K.red} tag="⚠ WARNING">
          {+d.calories<1200?"Calorie intake dangerously low (<1200 kcal). AI will flag this as a critical issue.":"Calorie intake extremely high (>4500 kcal). AI will analyze whether this aligns with your goal."}
        </Alert>
      )}
      <Grid cols="1fr 1fr 1fr">
        <Fld label="Protein (g)"><NumIn value={d.protein} onChange={v=>set("protein",v)} placeholder="140"/></Fld>
        <Fld label="Carbs (g)"><NumIn value={d.carbs} onChange={v=>set("carbs",v)} placeholder="230"/></Fld>
        <Fld label="Fats (g)"><NumIn value={d.fats} onChange={v=>set("fats",v)} placeholder="65"/></Fld>
      </Grid>
      {mSum&&d.calories&&Math.abs(mSum-+d.calories)>200&&(
        <Alert color={K.yel} tag="MACRO / CALORIE MISMATCH">
          Macros add up to ~{mSum} kcal but you entered {d.calories} kcal (Δ{Math.abs(mSum-+d.calories)} kcal). AI will note this discrepancy.
        </Alert>
      )}
    </div>,

    /* 4 — Lifestyle */
    <div key="life" className="anim-step" style={{display:"flex",flexDirection:"column",gap:14}}>
      <Fld label="Average Sleep Hours Per Night">
        <Grid cols="repeat(7,1fr)" gap={6}>
          {["4","5","6","7","8","9","10"].map(v=>{
            const low=+v<6, ac=d.sleep===v, col=low?K.red:K.grn;
            return (
              <button key={v} type="button" onClick={()=>set("sleep",v)} style={{
                padding:"12px 4px",borderRadius:6,
                border:`1px solid ${ac?col:K.b1}`,background:ac?col+"12":K.s3,
                fontFamily:"'Barlow Condensed',sans-serif",fontSize:20,fontWeight:800,
                color:ac?col:K.mut,cursor:"pointer",transition:"all .15s",outline:"none",
              }}>{v}</button>
            );
          })}
        </Grid>
        {+d.sleep<6&&<div style={{fontFamily:"'Barlow',sans-serif",fontSize:11,color:K.red,marginTop:4}}>
          ⚠ Critical: under 6 hrs disrupts hormones, muscle repair, and fat loss.
        </div>}
        {+d.sleep<5&&<Alert color={K.red} tag="PRIORITY ALERT">
          Less than 5 hours sleep is a medical concern. AI will deprioritize all other goals and focus on recovery.
        </Alert>}
      </Fld>
      <Fld label="Primary Training Type">
        <Sel value={d.trainingType} onChange={v=>set("trainingType",v)} opts={[
          {v:"strength",l:"Strength / Weightlifting"},{v:"cardio",l:"Cardio / Endurance"},
          {v:"mixed",l:"Mixed — Strength + Cardio"},{v:"calisthenics",l:"Calisthenics / Bodyweight"},
          {v:"yoga",l:"Yoga / Flexibility"},
        ]}/>
      </Fld>
      <Alert color={K.grn} tag="✓ PROFILE COMPLETE">
        All data collected. Click Generate AI Report to receive your full personalized analysis: BMI, ideal weight range, TDEE, goal alignment, lifestyle risk, action plan, timeline, and doubt clearing.
      </Alert>
    </div>,
  ];

  const pct = ((step+1)/OB_STEPS.length)*100;

  return (
    <div style={{minHeight:"100vh",background:K.bg,display:"flex",alignItems:"flex-start",
      justifyContent:"center",padding:"28px 20px 80px",overflowY:"auto",position:"relative"}}>
      <div style={{position:"fixed",inset:0,
        backgroundImage:`linear-gradient(${K.b1}50 1px,transparent 1px),linear-gradient(90deg,${K.b1}50 1px,transparent 1px)`,
        backgroundSize:"50px 50px",pointerEvents:"none",opacity:.5}}/>
      <div style={{position:"fixed",top:"8%",right:"-4%",width:350,height:350,borderRadius:"50%",
        background:`radial-gradient(${K.ora}08 0%,transparent 65%)`,pointerEvents:"none"}}/>

      <div className="anim-page" style={{width:"100%",maxWidth:560,position:"relative"}}>
        {/* Header */}
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:28}}>
          <div style={{width:32,height:32,borderRadius:7,border:`2px solid ${K.ora}`,
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,background:K.oraBg}}>⚡</div>
          <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:24,fontWeight:900,
            color:K.txt,letterSpacing:2}}>IRONTRACK <span style={{color:K.ora}}>PRO</span></span>
          <span style={{marginLeft:"auto",fontFamily:"'Roboto Mono',monospace",fontSize:10,color:K.dim}}>
            setup / <span style={{color:K.ora}}>{user?.name?.split(" ")[0].toLowerCase()}</span>
          </span>
        </div>

        {/* Stepper */}
        <div style={{marginBottom:22}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
            {OB_STEPS.map((s,i)=>(
              <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                <div style={{
                  width:34,height:34,borderRadius:"50%",
                  background:i<step?K.ora:i===step?K.oraBg:K.s2,
                  border:`1.5px solid ${i<=step?K.ora:K.b2}`,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:i<step?12:16,transition:"all .3s",
                  color:i<step?"#0a0a0a":K.dim,
                }}>{i<step?"✓":s.ic}</div>
                <Mono size={8} color={i<=step?K.ora:K.mut} style={{textTransform:"uppercase",letterSpacing:.8}}>
                  {s.lbl.split(" ")[0]}
                </Mono>
              </div>
            ))}
          </div>
          <div style={{height:2,background:K.s2,borderRadius:2}}>
            <div style={{height:"100%",width:`${pct}%`,
              background:`linear-gradient(90deg,${K.ora},${K.oraDim})`,
              borderRadius:2,transition:"width .4s ease"}}/>
          </div>
        </div>

        {/* Card */}
        <Card style={{padding:26}} accent>
          <div style={{marginBottom:20}}>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:26,fontWeight:800,
              color:K.txt,letterSpacing:.5}}>
              {OB_STEPS[step].ic} {OB_STEPS[step].lbl}
            </div>
            <Mono size={10} color={K.mut}>step {step+1} of {OB_STEPS.length}</Mono>
          </div>

          {pages[step]}

          <div style={{display:"flex",gap:10,marginTop:22}}>
            {step>0&&<Btn v="gst" onClick={()=>setStep(s=>s-1)} style={{flex:1}}>← BACK</Btn>}
            <Btn
              onClick={()=>{ if(step<OB_STEPS.length-1) setStep(s=>s+1); else onComplete(d); }}
              disabled={!canNext()} style={{flex:2}}>
              {step===OB_STEPS.length-1?"🚀 GENERATE AI REPORT":"CONTINUE →"}
            </Btn>
          </div>
        </Card>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   AI REPORT
═══════════════════════════════════════════════════════════════════════════ */
const AIReport = ({ profile }) => {
  const [report, setReport]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [openQ, setOpenQ]     = useState(null);

  const generate = async () => {
    setLoading(true); setError(null);
    try {
      const msg = `Age: ${profile.age} | Gender: ${profile.gender} | Height: ${profile.height}cm | Weight: ${profile.weight}kg
Body Fat: ${profile.bodyfat||"Not provided"} | Occupation: ${profile.occupation} | Activity: ${profile.activityLevel}
Experience: ${profile.experience} | Goal: ${profile.goal} | Workout Days: ${profile.workoutDays}/week
Calories: ${profile.calories}kcal/day | Protein: ${profile.protein}g | Carbs: ${profile.carbs}g | Fats: ${profile.fats}g
Sleep: ${profile.sleep}hrs/night | Training: ${profile.trainingType} | Medical: ${profile.medical||"None"}`;

      const res  = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:2000,
          system:AI_SYSTEM,
          messages:[{role:"user",content:msg}],
        }),
      });
      const data = await res.json();
      const raw  = data.content?.map(c=>c.text||"").join("")||"";
      const json = raw.replace(/```json|```/g,"").trim();
      setReport(JSON.parse(json));
    } catch(e) {
      setError("Failed to generate report. Check your connection and try again.");
    }
    setLoading(false);
  };

  useEffect(()=>{ generate(); },[]);

  if(loading) return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
      minHeight:500,gap:20}}>
      <div style={{position:"relative",width:72,height:72}}>
        <div style={{position:"absolute",inset:0,borderRadius:"50%",
          border:`3px solid ${K.s3}`,borderTopColor:K.ora,animation:"spin 1s linear infinite"}}/>
        <div style={{position:"absolute",inset:10,borderRadius:"50%",
          border:`2px solid ${K.s3}`,borderTopColor:K.blu,animation:"spin 1.5s linear infinite reverse"}}/>
        <div style={{position:"absolute",inset:20,borderRadius:"50%",
          border:`1.5px solid ${K.s3}`,borderTopColor:K.grn,animation:"spin 2s linear infinite"}}/>
      </div>
      <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:22,fontWeight:800,
        color:K.ora,letterSpacing:2}}>ANALYZING YOUR DATA</div>
      <div style={{display:"flex",flexDirection:"column",gap:4,alignItems:"center"}}>
        {["Calculating BMI + Ideal Weight…","Running TDEE formula…","Analyzing goal alignment…","Generating action plan…"].map((t,i)=>(
          <Mono key={i} size={10} color={K.mut} style={{animationDelay:`${i*.3}s`,animation:"fadeIn .4s ease both"}}>{t}</Mono>
        ))}
      </div>
    </div>
  );

  if(error) return (
    <Card style={{textAlign:"center",padding:48}}>
      <div style={{fontSize:44,marginBottom:12}}>⚠️</div>
      <div style={{fontFamily:"'Barlow',sans-serif",color:K.red,marginBottom:20,fontSize:14}}>{error}</div>
      <Btn onClick={generate}>RETRY</Btn>
    </Card>
  );
  if(!report) return null;

  const sc = report.score;
  const scColor = sc>=75?K.grn:sc>=50?K.yel:K.red;
  const [bLabel,bColor] = bmiInfo(report.bmi);
  const calColor = report.calorieStatus==="On Target"?K.grn:report.calorieStatus==="Deficit"?K.blu:K.yel;
  const wt = +profile.weight;
  const trendData = Array.from({length:6},(_,i)=>({w:`W${i+1}`,kg:+(wt+(5-i)*(report.calorieStatus==="Deficit"?.4:.2)).toFixed(1)}));

  return (
    <div className="fade-up" style={{display:"flex",flexDirection:"column",gap:16}}>
      {/* Header row */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:30,fontWeight:900,
          color:K.txt,letterSpacing:1.5}}>AI ANALYSIS REPORT</div>
        <Btn v="gst" onClick={generate} style={{fontSize:12,padding:"8px 14px"}}>↻ REGENERATE</Btn>
      </div>

      {/* Score banner */}
      <Card accent glowColor={scColor} style={{background:`linear-gradient(135deg,${scColor}0a,${K.s1})`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
          flexWrap:"wrap",gap:16}}>
          <div>
            <Mono size={9} color={scColor} style={{textTransform:"uppercase",letterSpacing:1.8,display:"block",marginBottom:4}}>
              FITNESS ALIGNMENT SCORE
            </Mono>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:80,fontWeight:900,
              color:scColor,lineHeight:1}}>{sc}</div>
            <Mono size={10} color={K.dim}>/100 performance index</Mono>
          </div>
          <div style={{maxWidth:310}}>
            <div style={{fontFamily:"'Barlow',sans-serif",fontSize:13,color:K.txt,
              lineHeight:1.75,marginBottom:12}}>{report.goalSummary}</div>
            <Pill color={report.onTrack?K.grn:K.yel}>
              {report.onTrack?"✓ ON TRACK":"⚠ NEEDS ADJUSTMENT"}
            </Pill>
          </div>
        </div>
      </Card>

      {/* Profile summary */}
      {report.profileSummary&&(
        <Card>
          <Mono size={9} color={K.mut} style={{textTransform:"uppercase",letterSpacing:1.8,display:"block",marginBottom:12}}>
            PROFILE SUMMARY
          </Mono>
          <Grid cols="repeat(4,1fr)" gap={10}>
            {Object.entries(report.profileSummary).map(([k,v])=>(
              <div key={k} style={{background:K.s2,borderRadius:6,padding:"10px 12px"}}>
                <Mono size={9} color={K.mut} style={{textTransform:"uppercase",letterSpacing:1.4,display:"block",marginBottom:4}}>{k}</Mono>
                <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:14,
                  color:K.txt}}>{v}</div>
              </div>
            ))}
          </Grid>
        </Card>
      )}

      {/* Health metrics */}
      <Grid gap={12}>
        <StatBox label="BMI" value={report.bmi} unit="body mass index" sub={bLabel} color={bColor}/>
        <StatBox label="Ideal Weight Range" value={`${report.idealMin}–${report.idealMax}`} unit="kg (Robinson & Devine)" sub={report.weightDiff} color={K.ora}/>
        <StatBox label="BMR" value={Math.round(report.bmr)} unit="kcal/day at rest" color={K.blu}/>
        <StatBox label="TDEE" value={report.tdee} unit="kcal/day maintenance" color={K.grn}/>
      </Grid>

      {/* Calorie status */}
      <Card>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
          <div>
            <Mono size={9} color={K.mut} style={{textTransform:"uppercase",letterSpacing:1.8,display:"block",marginBottom:6}}>CALORIE STATUS</Mono>
            <div style={{display:"flex",alignItems:"baseline",gap:12}}>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:38,fontWeight:900,color:calColor}}>
                {report.calorieStatus.toUpperCase()}
              </div>
              <Mono size={12} color={K.dim}>
                {report.calorieGap>0?`+${report.calorieGap}`:`${report.calorieGap}`} kcal vs TDEE
              </Mono>
            </div>
            <div style={{height:5,background:K.s3,borderRadius:3,width:280,marginTop:10}}>
              <div style={{height:"100%",
                width:`${Math.min(Math.abs(report.calorieGap)/600*100,100)}%`,
                background:calColor,borderRadius:3,transition:"width 1.5s ease"}}/>
            </div>
          </div>
          <Pill color={calColor} style={{marginTop:4}}>{profile.calories} kcal INTAKE</Pill>
        </div>
      </Card>

      {/* Working / Misaligned */}
      <Grid gap={12}>
        <Alert color={K.grn} tag="✓ WHAT'S WORKING">{report.whatWorking}</Alert>
        <Alert color={K.red} tag="⚠ WHAT'S MISALIGNED">{report.whatMisaligned}</Alert>
      </Grid>

      {/* Lifestyle risk (desk workers) */}
      {report.lifestyleRisk&&profile.occupation==="desk"&&(
        <Card>
          <Mono size={9} color={K.yel} style={{textTransform:"uppercase",letterSpacing:1.8,display:"block",marginBottom:12}}>
            👨‍💼 DESK PROFESSIONAL RISK ANALYSIS
          </Mono>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {[
              ["Sitting Impact",report.lifestyleRisk.sitting],
              ["Stress Factor",report.lifestyleRisk.stress],
              ["Sleep Impact",report.lifestyleRisk.sleep],
            ].map(([k,v])=>(
              <div key={k} style={{display:"flex",gap:12,padding:"10px 13px",background:K.s2,borderRadius:6}}>
                <Mono size={10} color={K.yel} style={{flexShrink:0,textTransform:"uppercase",letterSpacing:1.2,paddingTop:2,minWidth:100}}>{k}</Mono>
                <span style={{fontFamily:"'Barlow',sans-serif",fontSize:12,color:K.dim,lineHeight:1.65}}>{v}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Remarks */}
      <Card>
        <Mono size={9} color={K.mut} style={{textTransform:"uppercase",letterSpacing:1.8,display:"block",marginBottom:12}}>
          ⚠️ PERFORMANCE OBSERVATIONS
        </Mono>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {report.remarks?.map((r,i)=>(
            <div key={i} style={{display:"flex",alignItems:"flex-start",gap:12,
              padding:"11px 13px",background:K.s2,borderRadius:6,border:`1px solid ${K.b1}`}}>
              <Mono size={11} color={K.ora} style={{flexShrink:0,paddingTop:1}}>0{i+1}</Mono>
              <span style={{fontFamily:"'Barlow',sans-serif",fontSize:13,color:K.dim,lineHeight:1.65}}>{r}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Action Plan */}
      <Card accent style={{border:`1px solid ${K.ora}40`}}>
        <Mono size={9} color={K.ora} style={{textTransform:"uppercase",letterSpacing:1.8,display:"block",marginBottom:14}}>
          🚀 PRACTICAL ACTION PLAN
        </Mono>
        <Grid gap={10}>
          {[
            ["🔥 DAILY CALORIES",report.actionPlan?.dailyCalories],
            ["💪 PROTEIN TARGET",report.actionPlan?.proteinTarget],
            ["🏋️ WORKOUT PLAN",report.actionPlan?.workoutFrequency],
            ["🏃 CARDIO",report.actionPlan?.cardio],
            ["👟 STEP GOAL",report.actionPlan?.stepGoal],
            ["😴 SLEEP TARGET",report.actionPlan?.sleep],
          ].map(([k,v])=>(
            <div key={k} style={{padding:"12px 13px",background:K.s2,borderRadius:6,border:`1px solid ${K.b1}`}}>
              <Mono size={9} color={K.mut} style={{textTransform:"uppercase",letterSpacing:1.4,display:"block",marginBottom:5}}>{k}</Mono>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:15,color:K.txt}}>{v}</div>
            </div>
          ))}
        </Grid>
        <div style={{marginTop:10,padding:"12px 13px",background:K.ora+"0d",
          border:`1px solid ${K.ora}30`,borderRadius:6}}>
          <Mono size={9} color={K.ora} style={{textTransform:"uppercase",letterSpacing:1.6,display:"block",marginBottom:5}}>
            ⭐ HIGH-IMPACT HABIT FOCUS
          </Mono>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:16,color:K.txt}}>
            {report.actionPlan?.habitFocus}
          </div>
        </div>
      </Card>

      {/* Trend chart */}
      <Card>
        <Mono size={9} color={K.mut} style={{textTransform:"uppercase",letterSpacing:1.8,display:"block",marginBottom:14}}>
          📈 PROJECTED WEIGHT TREND
        </Mono>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke={K.b1}/>
            <XAxis dataKey="w" tick={{fontFamily:"'Roboto Mono',monospace",fontSize:10,fill:K.mut}} axisLine={false} tickLine={false}/>
            <YAxis domain={["auto","auto"]} tick={{fontFamily:"'Roboto Mono',monospace",fontSize:9,fill:K.mut}} axisLine={false} tickLine={false}/>
            <Tooltip contentStyle={{background:K.s2,border:`1px solid ${K.b1}`,
              fontFamily:"'Barlow',sans-serif",borderRadius:7,fontSize:12}}
              formatter={v=>[`${v} kg`]}/>
            <Line type="monotone" dataKey="kg" stroke={K.ora} strokeWidth={2.5} dot={{fill:K.ora,r:4,strokeWidth:0}}/>
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Timeline */}
      <Alert color={K.blu} tag="📈 REALISTIC PROGRESS TIMELINE">{report.timeline}</Alert>

      {/* Expert remark */}
      <Card style={{background:`linear-gradient(135deg,${K.ora}07,${K.s1})`,border:`1px solid ${K.ora}30`}}>
        <Mono size={9} color={K.ora} style={{textTransform:"uppercase",letterSpacing:1.8,display:"block",marginBottom:10}}>
          💬 EXPERT SUMMARY
        </Mono>
        <p style={{fontFamily:"'Barlow',sans-serif",fontSize:14,color:K.txt,lineHeight:1.8}}>
          {report.expertRemark}
        </p>
      </Card>

      {/* Doubt clearing */}
      {report.doubts?.length>0&&(
        <Card>
          <Mono size={9} color={K.mut} style={{textTransform:"uppercase",letterSpacing:1.8,display:"block",marginBottom:14}}>
            ❓ COMMON DOUBTS CLEARED
          </Mono>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {report.doubts.map((dbt,i)=>(
              <div key={i} style={{borderRadius:7,border:`1px solid ${openQ===i?K.ora:K.b1}`,
                overflow:"hidden",transition:"border-color .15s"}}>
                <button type="button" onClick={()=>setOpenQ(openQ===i?null:i)} style={{
                  width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",
                  padding:"12px 14px",background:K.s2,border:"none",cursor:"pointer",outline:"none",
                }}>
                  <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:14,
                    color:openQ===i?K.ora:K.txt,textAlign:"left",letterSpacing:.3}}>{dbt.q}</span>
                  <span style={{color:K.dim,fontSize:18,flexShrink:0,marginLeft:8}}>
                    {openQ===i?"−":"+"}
                  </span>
                </button>
                {openQ===i&&(
                  <div style={{padding:"11px 14px 14px",background:K.s3,
                    fontFamily:"'Barlow',sans-serif",fontSize:13,color:K.dim,lineHeight:1.75}}>
                    {dbt.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════════════════════════════════════ */
const Dashboard = ({ user, profile, setPage }) => {
  const w=+profile.weight, h=+profile.height, a=+profile.age;
  const bmi   = calcBMI(w,h);
  const [bLbl,bClr] = bmiInfo(bmi);
  const bmr   = calcBMR(w,h,a,profile.gender);
  const tdee  = calcTDEE(bmr,profile.activityLevel);
  const ideal = calcIdeal(h,profile.gender);
  const cal   = +profile.calories;
  const diff  = cal-tdee;
  const calSt = Math.abs(diff)<150?"ON TARGET":diff<0?"DEFICIT":"SURPLUS";
  const calCl = calSt==="ON TARGET"?K.grn:calSt==="DEFICIT"?K.blu:K.yel;
  const wDiff = (w-ideal.max).toFixed(1);

  const macros = [
    {name:"Protein",val:+profile.protein*4,g:profile.protein,color:K.ora},
    {name:"Carbs",  val:+profile.carbs*4,  g:profile.carbs,  color:K.blu},
    {name:"Fats",   val:+profile.fats*9,   g:profile.fats,   color:K.yel},
  ];

  return (
    <div className="fade-up" style={{display:"flex",flexDirection:"column",gap:16}}>
      {/* Welcome */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10}}>
        <div>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:32,fontWeight:900,
            color:K.txt,letterSpacing:1.5}}>
            WELCOME BACK, <span style={{color:K.ora}}>{user.name.split(" ")[0].toUpperCase()}</span>
          </div>
          <Mono size={10} color={K.dim} style={{marginTop:3}}>
            {profile.goal.replace("_"," ").toUpperCase()} · {profile.experience.toUpperCase()} · {profile.occupation.toUpperCase()}
          </Mono>
        </div>
        <Btn onClick={()=>setPage("ai")} style={{fontSize:13}}>VIEW AI REPORT →</Btn>
      </div>

      {/* Stats row */}
      <Grid gap={12}>
        <StatBox label="BMI" value={bmi} unit="body mass index" sub={bLbl} color={bClr}/>
        <StatBox label="Ideal Weight Range" value={`${ideal.min}–${ideal.max}`} unit="kg"
          sub={+wDiff>0?`${wDiff}kg above ideal`:+wDiff<0?`${Math.abs(wDiff)}kg below ideal`:"At ideal weight"} color={K.ora}/>
        <StatBox label="BMR" value={Math.round(bmr)} unit="kcal/day at rest" color={K.blu}/>
        <StatBox label="TDEE" value={tdee} unit="kcal/day maintenance" color={K.grn}/>
      </Grid>

      {/* Calorie */}
      <Card>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:8}}>
          <Mono size={9} color={K.mut} style={{textTransform:"uppercase",letterSpacing:1.8}}>CALORIE BALANCE</Mono>
          <Pill color={calCl}>{calSt}</Pill>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:20,flexWrap:"wrap"}}>
          <div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:38,fontWeight:900,color:calCl,lineHeight:1}}>{cal}</div>
            <Mono size={10} color={K.mut}>kcal intake</Mono>
          </div>
          <Mono size={16} color={K.mut}>vs</Mono>
          <div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:38,fontWeight:900,color:K.dim,lineHeight:1}}>{tdee}</div>
            <Mono size={10} color={K.mut}>kcal TDEE</Mono>
          </div>
          <div style={{flex:1,minWidth:120}}>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:16,fontWeight:700,color:calCl,marginBottom:6}}>
              {diff>0?`+${diff}`:`${diff}`} kcal/day
            </div>
            <div style={{height:5,background:K.s3,borderRadius:3}}>
              <div style={{height:"100%",width:`${Math.min(Math.abs(diff)/600*100,100)}%`,background:calCl,borderRadius:3}}/>
            </div>
          </div>
        </div>
      </Card>

      {/* Macros */}
      <Card>
        <Mono size={9} color={K.mut} style={{textTransform:"uppercase",letterSpacing:1.8,display:"block",marginBottom:14}}>MACRO BREAKDOWN</Mono>
        <div style={{display:"flex",gap:20,alignItems:"center",flexWrap:"wrap"}}>
          <PieChart width={120} height={120}>
            <Pie data={macros} cx={56} cy={56} innerRadius={30} outerRadius={54} dataKey="val" strokeWidth={0}>
              {macros.map((m,i)=><Cell key={i} fill={m.color}/>)}
            </Pie>
          </PieChart>
          <div style={{flex:1,display:"flex",flexDirection:"column",gap:10}}>
            {macros.map(m=>(
              <div key={m.name}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <span style={{fontFamily:"'Barlow',sans-serif",fontSize:12,color:K.dim}}>{m.name}</span>
                  <Mono size={11} color={m.color}>{m.g}g</Mono>
                </div>
                <div style={{height:4,background:K.s3,borderRadius:2}}>
                  <div style={{height:"100%",width:`${cal>0?m.val/cal*100:0}%`,background:m.color,borderRadius:2}}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Quick links */}
      <Grid gap={10}>
        {[
          {lbl:"🤖 AI REPORT",sub:"Full personalized analysis",pg:"ai",c:K.ora},
          {lbl:"🏋️ TRAIN",sub:"Log today's workout",pg:"workout",c:K.blu},
          {lbl:"🥗 NUTRITION",sub:"Track meals & macros",pg:"nutrition",c:K.grn},
          {lbl:"📊 ANALYTICS",sub:"Progress & trends",pg:"analytics",c:K.yel},
        ].map((l,i)=>(
          <button key={i} type="button" onClick={()=>setPage(l.pg)} style={{
            padding:"15px 16px",background:K.s2,border:`1px solid ${K.b1}`,
            borderRadius:7,cursor:"pointer",textAlign:"left",transition:"all .15s",outline:"none",
          }}
          onMouseOver={e=>{e.currentTarget.style.borderColor=l.c;e.currentTarget.style.background=l.c+"0a";}}
          onMouseOut={e=>{e.currentTarget.style.borderColor=K.b1;e.currentTarget.style.background=K.s2;}}>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:15,
              color:K.txt,letterSpacing:.4,marginBottom:3}}>{l.lbl}</div>
            <Mono size={10} color={K.mut}>{l.sub}</Mono>
          </button>
        ))}
      </Grid>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   WORKOUT LOGGER
═══════════════════════════════════════════════════════════════════════════ */
const WorkoutLogger = ({ experience }) => {
  const [sets, setSets]     = useState([]);
  const [ex, setEx]         = useState("Bench Press");
  const [reps, setReps]     = useState("");
  const [weight, setWeight] = useState("");
  const EXERCISES = ["Bench Press","Squat","Deadlift","Overhead Press","Pull Up","Barbell Row","Bicep Curl","Tricep Pushdown","Leg Press","Plank"];

  const addSet = () => {
    if(!reps||!weight) return;
    setSets(p=>[...p,{id:Date.now(),ex,reps:+reps,weight:+weight,vol:+reps*+weight}]);
    setReps(""); setWeight("");
  };

  const totalVol = sets.reduce((s,x)=>s+x.vol,0);
  const grouped  = sets.reduce((acc,s)=>({...acc,[s.ex]:[...(acc[s.ex]||[]),s]}),{});

  return (
    <div className="fade-up" style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:30,fontWeight:900,
          color:K.txt,letterSpacing:1.5}}>WORKOUT LOG</div>
        {experience&&<Pill color={K.ora}>{experience.toUpperCase()}</Pill>}
      </div>

      <Card accent>
        <Mono size={9} color={K.mut} style={{textTransform:"uppercase",letterSpacing:1.8,display:"block",marginBottom:14}}>LOG A SET</Mono>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <Fld label="Exercise">
            <Sel value={ex} onChange={setEx} opts={EXERCISES.map(e=>({v:e,l:e}))}/>
          </Fld>
          <Grid>
            <Fld label="Reps"><NumIn value={reps} onChange={setReps} placeholder="e.g. 8"/></Fld>
            <Fld label="Weight (kg)"><NumIn value={weight} onChange={setWeight} placeholder="e.g. 60"/></Fld>
          </Grid>
          <Btn onClick={addSet} disabled={!reps||!weight} style={{width:"100%"}}>+ LOG SET</Btn>
        </div>
      </Card>

      {sets.length>0&&(
        <>
          <Grid gap={12}>
            <StatBox label="Total Sets" value={sets.length} color={K.ora}/>
            <StatBox label="Total Volume" value={totalVol.toLocaleString()} unit="kg" color={K.blu}/>
          </Grid>
          {Object.entries(grouped).map(([name,exSets])=>(
            <Card key={name}>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:16,
                color:K.txt,letterSpacing:.4,marginBottom:12}}>{name}</div>
              <div style={{display:"flex",flexDirection:"column",gap:5}}>
                {exSets.map((s,i)=>(
                  <div key={s.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
                    padding:"9px 13px",background:K.s2,borderRadius:6}}>
                    <Mono size={10} color={K.mut}>SET {i+1}</Mono>
                    <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:15,color:K.txt}}>
                      {s.reps} × {s.weight} kg
                    </span>
                    <Mono size={11} color={K.ora}>{s.vol} vol</Mono>
                    <button type="button" onClick={()=>setSets(p=>p.filter(x=>x.id!==s.id))}
                      style={{background:"none",border:"none",color:K.dim,cursor:"pointer",fontSize:16}}>×</button>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   NUTRITION
═══════════════════════════════════════════════════════════════════════════ */
const Nutrition = ({ profile }) => {
  const [meals, setMeals] = useState([]);
  const [f, setF]         = useState({name:"",cal:"",prot:"",carb:"",fat:""});
  const sf = (k,v) => setF(p=>({...p,[k]:v}));

  const add = () => {
    if(!f.name||!f.cal) return;
    setMeals(p=>[...p,{id:Date.now(),...f,cal:+f.cal,prot:+f.prot,carb:+f.carb,fat:+f.fat}]);
    setF({name:"",cal:"",prot:"",carb:"",fat:""});
  };

  const tot = {cal:meals.reduce((s,m)=>s+m.cal,0), prot:meals.reduce((s,m)=>s+m.prot,0)};
  const tgt = {cal:+profile.calories, prot:+profile.protein};

  return (
    <div className="fade-up" style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:30,fontWeight:900,
        color:K.txt,letterSpacing:1.5}}>NUTRITION LOG</div>

      <Grid gap={12}>
        {[
          {lbl:"Calories",cur:tot.cal,tgt:tgt.cal,unit:"kcal",color:K.ora},
          {lbl:"Protein",cur:tot.prot,tgt:tgt.prot,unit:"g",color:K.blu},
        ].map(x=>(
          <Card key={x.lbl}>
            <Mono size={9} color={K.mut} style={{textTransform:"uppercase",letterSpacing:1.8,display:"block",marginBottom:6}}>{x.lbl}</Mono>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:32,color:x.color,lineHeight:1}}>
              {x.cur}<span style={{fontSize:16,color:K.dim,fontWeight:400}}>/{x.tgt}{x.unit}</span>
            </div>
            <div style={{height:5,background:K.s3,borderRadius:3,marginTop:8}}>
              <div style={{height:"100%",width:`${Math.min(x.cur/x.tgt*100,100)}%`,
                background:x.cur>x.tgt?K.red:x.color,borderRadius:3}}/>
            </div>
          </Card>
        ))}
      </Grid>

      <Card accent>
        <Mono size={9} color={K.mut} style={{textTransform:"uppercase",letterSpacing:1.8,display:"block",marginBottom:14}}>ADD MEAL</Mono>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <Fld label="Meal Name"><TxtIn value={f.name} onChange={v=>sf("name",v)} placeholder="e.g. Breakfast — Oats + Eggs"/></Fld>
          <Grid cols="repeat(4,1fr)" gap={10}>
            <Fld label="Calories"><NumIn value={f.cal} onChange={v=>sf("cal",v)} placeholder="400"/></Fld>
            <Fld label="Protein (g)"><NumIn value={f.prot} onChange={v=>sf("prot",v)} placeholder="30"/></Fld>
            <Fld label="Carbs (g)"><NumIn value={f.carb} onChange={v=>sf("carb",v)} placeholder="50"/></Fld>
            <Fld label="Fats (g)"><NumIn value={f.fat} onChange={v=>sf("fat",v)} placeholder="10"/></Fld>
          </Grid>
          <Btn onClick={add} disabled={!f.name||!f.cal} style={{width:"100%"}}>+ ADD MEAL</Btn>
        </div>
      </Card>

      {meals.map(m=>(
        <Card key={m.id}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
            <div>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:16,color:K.txt,letterSpacing:.3}}>{m.name}</div>
              <Mono size={10} color={K.mut} style={{marginTop:4}}>{m.prot}g protein · {m.carb}g carbs · {m.fat}g fats</Mono>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:14}}>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:26,color:K.ora}}>{m.cal} kcal</div>
              <button type="button" onClick={()=>setMeals(p=>p.filter(x=>x.id!==m.id))}
                style={{background:"none",border:"none",color:K.dim,cursor:"pointer",fontSize:18}}>×</button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   ANALYTICS
═══════════════════════════════════════════════════════════════════════════ */
const Analytics = ({ profile }) => {
  const wt  = +profile.weight;
  const trend = Array.from({length:6},(_,i)=>({w:`W${i+1}`,kg:+(wt+(5-i)*.55).toFixed(1)}));
  const vol   = [{wk:"W3",vol:8200},{wk:"W4",vol:10400},{wk:"W5",vol:11900},{wk:"W6",vol:13600}];
  const PRs   = [{name:"Bench Press",val:"100 kg",date:"Feb 14"},{name:"Squat",val:"120 kg",date:"Feb 20"},{name:"Deadlift",val:"140 kg",date:"Feb 22"}];

  return (
    <div className="fade-up" style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:30,fontWeight:900,
        color:K.txt,letterSpacing:1.5}}>ANALYTICS</div>

      <Card>
        <Mono size={9} color={K.ora} style={{textTransform:"uppercase",letterSpacing:1.8,display:"block",marginBottom:14}}>WEIGHT TREND (KG)</Mono>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={trend}>
            <CartesianGrid strokeDasharray="3 3" stroke={K.b1}/>
            <XAxis dataKey="w" tick={{fontFamily:"'Roboto Mono',monospace",fontSize:10,fill:K.mut}} axisLine={false} tickLine={false}/>
            <YAxis domain={["auto","auto"]} tick={{fontFamily:"'Roboto Mono',monospace",fontSize:9,fill:K.mut}} axisLine={false} tickLine={false}/>
            <Tooltip contentStyle={{background:K.s2,border:`1px solid ${K.b1}`,fontFamily:"'Barlow',sans-serif",borderRadius:7,fontSize:12}}
              formatter={v=>[`${v} kg`]}/>
            <Line type="monotone" dataKey="kg" stroke={K.ora} strokeWidth={2.5} dot={{fill:K.ora,r:4,strokeWidth:0}}/>
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <Mono size={9} color={K.blu} style={{textTransform:"uppercase",letterSpacing:1.8,display:"block",marginBottom:14}}>WEEKLY TRAINING VOLUME</Mono>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={vol}>
            <CartesianGrid strokeDasharray="3 3" stroke={K.b1}/>
            <XAxis dataKey="wk" tick={{fontFamily:"'Roboto Mono',monospace",fontSize:10,fill:K.mut}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fontFamily:"'Roboto Mono',monospace",fontSize:9,fill:K.mut}} axisLine={false} tickLine={false}/>
            <Tooltip contentStyle={{background:K.s2,border:`1px solid ${K.b1}`,fontFamily:"'Barlow',sans-serif",borderRadius:7,fontSize:12}}/>
            <Bar dataKey="vol" name="Volume (kg)" fill={K.blu} radius={[4,4,0,0]} opacity={.85}/>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <Mono size={9} color={K.yel} style={{textTransform:"uppercase",letterSpacing:1.8,display:"block",marginBottom:14}}>🏆 PERSONAL RECORDS</Mono>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {PRs.map((pr,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
              padding:"11px 14px",background:K.s2,borderRadius:6,border:`1px solid ${K.b1}`}}>
              <div>
                <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:15,
                  color:K.txt,letterSpacing:.3}}>{pr.name}</div>
                <Mono size={10} color={K.mut}>{pr.date}</Mono>
              </div>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:26,fontWeight:900,color:K.yel}}>{pr.val}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   APP ROOT
═══════════════════════════════════════════════════════════════════════════ */
export default function App() {
  const [screen, setScreen] = useState("login");
  const [user,   setUser]   = useState(null);
  const [profile,setProf]   = useState(null);
  const [page,   setPage]   = useState("dashboard");

  const handleLogin = u => {
    setUser(u);
    if(u.profile){ setProf(u.profile); setScreen("app"); }
    else setScreen("onboard");
  };
  const handleOnboard = data => { setProf(data); setScreen("app"); setPage("ai"); };
  const handleLogout  = () => { setUser(null); setProf(null); setScreen("login"); setPage("dashboard"); };

  if(screen==="login")   return <Login onLogin={handleLogin}/>;
  if(screen==="onboard") return <Onboarding user={user} onComplete={handleOnboard}/>;

  const NAV=[
    {id:"dashboard",ic:"⊞",lbl:"HOME"},
    {id:"ai",ic:"🤖",lbl:"AI"},
    {id:"workout",ic:"🏋️",lbl:"TRAIN"},
    {id:"nutrition",ic:"🥗",lbl:"EAT"},
    {id:"analytics",ic:"📊",lbl:"STATS"},
  ];

  const PAGES = {
    dashboard: <Dashboard user={user} profile={profile} setPage={setPage}/>,
    ai:        <AIReport profile={profile}/>,
    workout:   <WorkoutLogger experience={profile?.experience}/>,
    nutrition: <Nutrition profile={profile}/>,
    analytics: <Analytics profile={profile}/>,
  };

  return (
    <div style={{background:K.bg,minHeight:"100vh",display:"flex",flexDirection:"column"}}>
      {/* Header */}
      <div style={{background:K.s1,borderBottom:`1px solid ${K.b1}`,padding:"11px 18px",
        display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:28,height:28,borderRadius:6,border:`1.5px solid ${K.ora}`,
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,background:K.oraBg}}>⚡</div>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:20,fontWeight:900,
            color:K.txt,letterSpacing:2}}>IRON<span style={{color:K.ora}}>TRACK</span> <span style={{color:K.dim,fontWeight:400,fontSize:14}}>PRO</span></div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{textAlign:"right"}}>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:15,
              color:K.txt,letterSpacing:.4}}>{user.name}</div>
            <Mono size={9} color={K.dim}>
              {profile.goal?.replace("_"," ").toUpperCase()} · {profile.experience?.toUpperCase()}
            </Mono>
          </div>
          <button type="button" onClick={handleLogout} title="Logout" style={{
            width:32,height:32,borderRadius:"50%",
            background:`linear-gradient(135deg,${K.ora},${K.oraDim})`,
            border:"none",cursor:"pointer",
            fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:11,color:"#0a0a0a",
          }}>{user.av}</button>
        </div>
      </div>

      {/* Page */}
      <div key={page} className="anim-page" style={{flex:1,overflowY:"auto",padding:"18px 16px 100px"}}>
        {PAGES[page]}
      </div>

      {/* Bottom Nav */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,background:K.s1,
        borderTop:`1px solid ${K.b1}`,display:"flex",justifyContent:"space-around",alignItems:"center",padding:"5px 0"}}>
        {NAV.map(n=>(
          <button key={n.id} type="button" onClick={()=>setPage(n.id)} style={{
            display:"flex",flexDirection:"column",alignItems:"center",gap:2,
            background:page===n.id?K.oraBg:"none",
            border:`1px solid ${page===n.id?K.ora+"40":"transparent"}`,
            borderRadius:7,cursor:"pointer",padding:"7px 14px",transition:"all .15s",outline:"none",
          }}>
            <span style={{fontSize:17}}>{n.ic}</span>
            <Mono size={8} color={page===n.id?K.ora:K.mut} style={{letterSpacing:.6}}>{n.lbl}</Mono>
          </button>
        ))}
        <button type="button" onClick={()=>{
          const ids=NAV.map(n=>n.id);
          const cur=ids.indexOf(page);
          setPage(ids[(cur+1)%ids.length]);
        }} style={{
          display:"flex",flexDirection:"column",alignItems:"center",gap:2,
          background:`linear-gradient(135deg,${K.ora},${K.oraDim})`,
          border:"none",borderRadius:7,cursor:"pointer",padding:"7px 12px",
          transition:"all .15s",outline:"none",
        }}>
          <span style={{fontSize:17}}>→</span>
          <Mono size={8} color="#0a0a0a" style={{letterSpacing:.6,fontWeight:700}}>NEXT</Mono>
        </button>
      </div>
    </div>
  );
}
