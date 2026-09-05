
import express from "express";
import crypto from "crypto";

const app = express();
const PORT = process.env.PORT || 3000;
const CLIENT_ID = process.env.DERIV_CLIENT_ID;
const REDIRECT_URI = process.env.DERIV_REDIRECT_URI || `http://localhost:${PORT}/callback`;
const pending = new Map(), sessions = new Map();

const b64 = b => Buffer.from(b).toString("base64url");
function cookies(req) {
  return Object.fromEntries((req.headers.cookie || "").split(";").filter(Boolean).map(v => {
    const i=v.indexOf("="); return [v.slice(0,i).trim(), decodeURIComponent(v.slice(i+1))];
  }));
}
app.use(express.json());
app.use(express.static("public"));

app.get("/auth/login",(req,res)=>{
  if(!CLIENT_ID) return res.status(500).send("DERIV_CLIENT_ID is not configured.");
  const state=b64(crypto.randomBytes(24)), verifier=b64(crypto.randomBytes(48));
  const challenge=b64(crypto.createHash("sha256").update(verifier).digest());
  pending.set(state,{verifier,at:Date.now()});
  const u=new URL("https://auth.deriv.com/oauth2/auth");
  for(const [k,v] of Object.entries({
    response_type:"code",client_id:CLIENT_ID,redirect_uri:REDIRECT_URI,
    scope:"trade",state,code_challenge:challenge,code_challenge_method:"S256"
  })) u.searchParams.set(k,v);
  res.redirect(u);
});

app.get("/callback",async(req,res)=>{
  const p=pending.get(req.query.state); pending.delete(req.query.state);
  if(req.query.error) return res.status(400).send("Deriv authorization was cancelled.");
  if(!p || Date.now()-p.at>300000) return res.status(400).send("Invalid or expired OAuth state.");
  try {
    const body=new URLSearchParams({
      grant_type:"authorization_code",client_id:CLIENT_ID,code:req.query.code,
      code_verifier:p.verifier,redirect_uri:REDIRECT_URI
    });
    const r=await fetch("https://auth.deriv.com/oauth2/token",{
      method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body
    });
    const t=await r.json();
    if(!r.ok || !t.access_token) throw new Error(JSON.stringify(t));
    const sid=b64(crypto.randomBytes(24));
    sessions.set(sid,{token:t.access_token,expires:Date.now()+(t.expires_in||3600)*1000});
    res.setHeader("Set-Cookie",`sid=${sid}; HttpOnly; SameSite=Lax; Path=/`);
    res.redirect("/?connected=1");
  } catch(e) { console.error(e); res.status(500).send("OAuth token exchange failed."); }
});

app.get("/api/session",(req,res)=>{
  const s=sessions.get(cookies(req).sid);
  res.json({connected:!!s && s.expires>Date.now()});
});
app.post("/api/logout",(req,res)=>{
  sessions.delete(cookies(req).sid);
  res.setHeader("Set-Cookie","sid=; Max-Age=0; HttpOnly; SameSite=Lax; Path=/");
  res.json({ok:true});
});
app.listen(PORT,()=>console.log(`cryptic.site running at http://localhost:${PORT}`));
