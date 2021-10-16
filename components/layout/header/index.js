import Link from 'next/link'

export default function Header () {
  
  return (
    <header>
      <noscript>
        <style>{`.nojs-show { opacity: 1; top: 0; }`}</style>
      </noscript>
    </header>
  )
}
