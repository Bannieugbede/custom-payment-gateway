import Link from "next/link";
import styles from "@/styles/navbar.module.css";

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>Payment Gateway</div>
      <div className={styles.links}>
        <Link href="/login">Login</Link>
      </div>
    </nav>
  );
}