import Header from "../Header/Header";
import SideBar from "../SideBar/SideBar";
import styles from "./AppShell.module.css";

interface AppShellProps {}

const AppShell = () => {
  return (
    <div>
      <Header />
      <SideBar />
      <div className={styles.contentContainer}>children</div>
    </div>
  );
};

export default AppShell;
