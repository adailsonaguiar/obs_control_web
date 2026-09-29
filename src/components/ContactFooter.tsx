import {memo} from 'react'

function ContactFooterComponent() {
  return <footer className="contact-footer">
    <span>Desenvolvido por <a href="https://verolabso.com/" target="_blank" rel="noreferrer">Vero Lab</a></span>
    <span aria-hidden="true">•</span>
    <a href="mailto:verolabso@gmail.com">verolabso@gmail.com</a>
  </footer>
}

export const ContactFooter = memo(ContactFooterComponent)
