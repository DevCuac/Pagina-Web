import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoText}>CROSS</span>
            <span className={styles.logoAccent}>PIXEL</span>
          </Link>
          <p className={styles.tagline}>The Ultimate Minecraft Experience</p>
        </div>

        <div className={styles.links}>
          <div className={styles.column}>
            <h4 className={styles.columnTitle}>Navegación</h4>
            <Link href="/">Inicio</Link>
            <Link href="/games">Modos de Juego</Link>
            <Link href="/forums">Foros</Link>
            <Link href="/members">Miembros</Link>
          </div>

          <div className={styles.column}>
            <h4 className={styles.columnTitle}>Soporte</h4>
            <Link href="/support">Centro de Soporte</Link>
            <Link href="/status">Estado del Servidor</Link>
          </div>

          <div className={styles.column}>
            <h4 className={styles.columnTitle}>Comunidad</h4>
            <a href="https://discord.gg/crosspixel" target="_blank" rel="noopener noreferrer">
              Discord
            </a>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <p>© CrossPixel {new Date().getFullYear()}. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
