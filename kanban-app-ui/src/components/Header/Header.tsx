import DownArrowIcon from "../../icons/DownArrowIcon";
import LogoIcon from "../../icons/LogoIcon";
import PipsIcon from "../../icons/PipsIcon";
import PlusIcon from "../../icons/PlusIcon";
import styles from "./Header.module.css";

interface HeaderProps {}

const Header = () => {
  return (
    <header className={styles.container}>
      <div className={styles.logoSection}>
        <LogoIcon />
        <button className={styles.boardSelectButton}>
          Platform Launch <DownArrowIcon />
        </button>
      </div>
      <div className={styles.rightButtons}>
        <button className={styles.plusButton}>
          <PlusIcon />
        </button>
        <button className={styles.pipsButton}>
          <PipsIcon />
        </button>
      </div>
    </header>
  );
};

export default Header;
