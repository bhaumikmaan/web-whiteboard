import React from 'react'
import styles from './FooterBadge.module.css'

export default function FooterBadge() {
  return (
    <a
      className={styles.madeWith}
      href="https://github.com/bhaumikmaan"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Made with love by bhaumikmaan"
      title="Made with ♥ by bhaumikmaan"
    >
      Made with <span className={styles.heart} aria-hidden="true">❤</span> by bhaumikmaan
    </a>
  )
}
