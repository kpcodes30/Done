const SUPABASE_URL = "https://pevhgvplhwosmrfqwuid.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBldmhndnBsaHdvc21yZnF3dWlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNzk1NTksImV4cCI6MjA3NDY1NTU1OX0.K1MipZx0v2COiJk6vZizGwU_S6dOQxljj52cQaDD12Q";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function show(msg) {
  document.getElementById("output").textContent = msg;
}

// signup
document.getElementById("signup-btn").onclick = async () => {
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-pass").value;
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) show("Sign up error: " + error.message);
  else show("Signed up: " + JSON.stringify(data, null, 2));
};

// login
document.getElementById("login-btn").onclick = async () => {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-pass").value;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) show("Login error: " + error.message);
  else show("Logged in: " + JSON.stringify(data, null, 2));
};

// logout
document.getElementById("logout-btn").onclick = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) show("Logout error: " + error.message);
  else show("Logged out");
};