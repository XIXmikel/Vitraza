function VitrazaFooter({ bgColor }) {
  const fondo = bgColor || '#1f2937'
  return (
    <footer className="w-full text-white/70" style={{ backgroundColor: fondo }}>
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <img src="/vitraza-logo-blanco.png" alt="Vitraza" className="h-8 mb-4" />
            <p className="text-sm text-white/60 leading-relaxed max-w-xs">
              Crea el catálogo de tu negocio y recibe pedidos por WhatsApp. Sencillo, rápido y profesional.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Contacto</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#" className="flex items-center gap-2 hover:text-white transition">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 00-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1012 2m0 1.8a8.2 8.2 0 11-4.2 15.2l-.3-.2-2.8.8.8-2.8-.2-.3A8.2 8.2 0 0112 3.8m4.7 10.3c-.3-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.3-.6.8-.8 1-.1.1-.3.2-.5 0-.3-.1-1.1-.4-2-1.2-.8-.7-1.3-1.5-1.4-1.8-.1-.2 0-.4.1-.5l.4-.4c.1-.2.2-.3.2-.5.1-.2 0-.3 0-.5s-.6-1.4-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.3.3-1 .9-1 2.3s1 2.7 1.2 2.9c.1.2 2 3 4.8 4.2.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3" /></svg>
                  Contáctanos por WhatsApp
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center gap-2 hover:text-white transition">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 5L2 7"/></svg>
                  Escríbenos por correo
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Vitraza</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-white transition">Conoce Vitraza</a></li>
              <li><a href="#" className="hover:text-white transition">Crea tu catálogo</a></li>
              <li><a href="#" className="hover:text-white transition">Cómo funciona</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-white/50">© {new Date().getFullYear()} Vitraza. Todos los derechos reservados.</p>
          <p className="text-xs text-white/50">Hecho con Vitraza</p>
        </div>
      </div>
    </footer>
  )
}

export default VitrazaFooter