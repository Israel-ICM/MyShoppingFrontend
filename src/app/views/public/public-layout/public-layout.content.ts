export interface Faq {
  id: number;
  pregunta: string;
  respuesta: string;
}

export interface ContactItem {
  id: string;
  icon: string;
  iconClass: string;
  label: string;
  value: string;
  href: string;
}

/** Contenido estático de FAQ/contactos, igual al del sitio anterior (sin backend propio). */
export const FAQS: Faq[] = [
  {
    id: 1,
    pregunta: '¿Son todos los productos originales?',
    respuesta: '<p>Sí, todos nuestros productos son originales y pedidos de tiendas oficiales.</p>',
  },
  {
    id: 2,
    pregunta: '¿Tienen una tienda física?',
    respuesta:
      '<p>No, por el momento no contamos con una tienda física, todas nuestras ventas son en línea.</p>',
  },
  {
    id: 3,
    pregunta: '¿El pago de los productos son por adelantado?',
    respuesta:
      '<p>Para las entregas dentro de la ciudad de La Paz el pago se realiza al momento de la entrega, a excepción de algún caso muy específico de que se quiera realizar una reserva con días de anticipación u otro caso que el vendedor vea necesario.</p><p>Para el caso de envíos fuera de la ciudad de La Paz el pago sí es por adelantado mediante QR o transferencia bancaria.</p>',
  },
  {
    id: 4,
    pregunta: '¿Hacen pedidos personalizados?',
    respuesta:
      '<p>Sí, podemos realizar un pedido de algún o algunos productos en específico (tomar nota de que el producto podría demorar alrededor de un mes en llegar).</p>',
  },
  {
    id: 5,
    pregunta: '¿Hacen envíos a otros departamentos?',
    respuesta: '<p>Hacemos envíos a todos los departamentos de Bolivia.</p>',
  },
  {
    id: 6,
    pregunta: '¿El envío a otros departamentos tiene algún costo?',
    respuesta:
      '<p>Sí, realizamos el envío con el costo que nos cobra el transporte (Bus), ya sea elegido por nosotros o el transporte de su preferencia. El cobro depende del peso y tamaño del producto (regularmente ronda entre los 15 Bs. y 30 Bs).</p>',
  },
];

export const CONTACT_ITEMS: ContactItem[] = [
  {
    id: 'whatsapp',
    icon: 'fab fa-whatsapp',
    iconClass: 'whatsapp',
    label: 'WhatsApp',
    value: '+591 63053155',
    href: 'https://wa.me/59163053155',
  },
  {
    id: 'email',
    icon: 'fas fa-envelope',
    iconClass: 'email',
    label: 'Email',
    value: 'ventas@myshopping.es',
    href: 'mailto:ventas@myshopping.es',
  },
  {
    id: 'tiktok',
    icon: 'fab fa-tiktok',
    iconClass: 'tiktok',
    label: 'TikTok',
    value: '@my_shopping_bolivia',
    href: 'https://www.tiktok.com/@my_shopping_bolivia',
  },
  {
    id: 'facebook',
    icon: 'fab fa-facebook-f',
    iconClass: 'facebook',
    label: 'Facebook',
    value: 'myshopping',
    href: 'https://www.facebook.com/profile.php?id=61583523375298',
  },
];

export const SHIPPING_ROWS: Array<{ departamento: string; costo: string; gratis?: boolean }> = [
  { departamento: 'La Paz', costo: 'Gratis', gratis: true },
  { departamento: 'Cochabamba', costo: 'Bs. 15 — 30' },
  { departamento: 'Santa Cruz', costo: 'Bs. 15 — 30' },
  { departamento: 'Oruro', costo: 'Bs. 15 — 30' },
  { departamento: 'Potosí', costo: 'Bs. 15 — 30' },
  { departamento: 'Chuquisaca', costo: 'Bs. 15 — 30' },
  { departamento: 'Tarija', costo: 'Bs. 15 — 30' },
  { departamento: 'Beni', costo: 'Bs. 15 — 30' },
  { departamento: 'Pando', costo: 'Bs. 15 — 30' },
];
