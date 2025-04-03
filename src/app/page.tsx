// import PaymentForm from "@/components/PaymentForm";
import permit from "@/lib/permit";
import LoginPage from "./login/page";
import SignupPage from "./signup/page";
// import Navbar from "@/components/Navbar";

export default async function PaymentPage() {
  const userId = ""; // In a real app, get this from the session or auth provider

  // Check if the user has permission to access the payment page
  const hasAccess = await permit.check(userId, "pay", "payment");
  console.log(hasAccess, "access");
  

  if (!hasAccess) {
    return (
      <div>
        {/* <Navbar /> */}
        <div style={{ textAlign: "center", padding: "4rem" }}>
          {/* <h1>Unauthorized</h1>
          <p>You do not have permission to access this page.</p> */}
        <SignupPage/>
        </div>
      </div>
    );
  } else{
    return (
      <div>
        {/* <Navbar /> */}
        <div style={{ padding: "2rem" }}>
          <h1 style={{ textAlign: "center" }}>Payment Gateway</h1>
          <LoginPage/>
          {/* <PaymentForm /> */}
        </div>
      </div>
    );
  }

}