/* Chat de dúvidas da Notte Stays — respostas prontas, sem servidor e sem inteligência artificial.
   As respostas saem só da BASE abaixo (tirada das páginas do site e dos guias do hóspede).
   Pergunta sem resposta na base vai para o WhatsApp, com a pergunta já escrita.
   Para mudar uma resposta: editar o texto em BASE; para o chat entender outro jeito de perguntar: acrescentar em k (palavras-chave).
   Palavra-chave: frase com espaço precisa aparecer inteira; palavra com 4+ letras vale como começo de palavra ("estacion" pega "estacionamento");
   palavra de até 3 letras só vale exata. ":1" no fim dá peso menor (a palavra ajuda, mas sozinha não decide). Peso normal = 2; ":3" pesa mais. */
(function () {
  'use strict';

  var WA_NUM = '5582996196123';
  var IG_URL = 'https://www.instagram.com/nottestays/';
  var LANGS = ['pt', 'en', 'es'];

  var UI = {
    pt: {
      launch: 'Dúvidas?', open: 'Abrir o chat de dúvidas', close: 'Fechar o chat', ig: 'Instagram da Notte Stays',
      sub: 'Assistente · responde na hora', ph: 'Escreva a sua pergunta…', send: 'Enviar',
      hello: 'Olá! Eu sou o assistente da **Notte Stays**. Respondo na hora as dúvidas sobre os nossos imóveis em Maceió e na Barra de São Miguel. Escolha um assunto ou escreva a sua pergunta.',
      miss: 'Essa eu não sei responder com certeza e prefiro não arriscar. Fale direto com a gente no WhatsApp: a sua pergunta já vai escrita.',
      thanks: 'Por nada! Se surgir outra dúvida, é só perguntar.',
      wa: 'Falar no WhatsApp', waAsk: 'Perguntar no WhatsApp', igChip: 'Ver o Instagram', menu: 'Outras dúvidas',
      waHello: 'Olá! Vim pelo site da Notte e quero me hospedar.',
      waQ: 'Olá! Vim pelo site da Notte. Minha dúvida: ',
      waDono: 'Olá! Vim pelo site da Notte. Tenho um imóvel e gostaria de saber como funciona a administração.',
      note: 'Respostas automáticas com base nas informações do site.',
      props: { nt: 'New Time', loft: 'Loft Residence', iloa: 'ILOA' }
    },
    en: {
      launch: 'Questions?', open: 'Open the help chat', close: 'Close the chat', ig: 'Notte Stays on Instagram',
      sub: 'Assistant · instant answers', ph: 'Type your question…', send: 'Send',
      hello: 'Hi! I\'m the **Notte Stays** assistant. I can answer questions about our homes in Maceió and Barra de São Miguel right away. Pick a topic or type your question.',
      miss: 'I\'m not sure about that one and would rather not guess. Message us on WhatsApp: your question will already be typed in.',
      thanks: 'You\'re welcome! Ask me anything else anytime.',
      wa: 'Chat on WhatsApp', waAsk: 'Ask on WhatsApp', igChip: 'See our Instagram', menu: 'Other questions',
      waHello: 'Hi! I found Notte Stays on the website and would like to book a stay.',
      waQ: 'Hi! I found Notte Stays on the website. My question: ',
      waDono: 'Hi! I found Notte Stays on the website. I own a property and would like to know how your management works.',
      note: 'Automatic answers based on the information on this website.',
      props: { nt: 'New Time', loft: 'Loft Residence', iloa: 'ILOA' }
    },
    es: {
      launch: '¿Dudas?', open: 'Abrir el chat de dudas', close: 'Cerrar el chat', ig: 'Instagram de Notte Stays',
      sub: 'Asistente · responde al instante', ph: 'Escribe tu pregunta…', send: 'Enviar',
      hello: '¡Hola! Soy el asistente de **Notte Stays**. Respondo al instante las dudas sobre nuestros alojamientos en Maceió y Barra de São Miguel. Elige un tema o escribe tu pregunta.',
      miss: 'De esa no estoy seguro y prefiero no adivinar. Escríbenos por WhatsApp: tu pregunta ya va escrita.',
      thanks: '¡De nada! Si tienes otra duda, pregúntame.',
      wa: 'Hablar por WhatsApp', waAsk: 'Preguntar por WhatsApp', igChip: 'Ver el Instagram', menu: 'Otras dudas',
      waHello: '¡Hola! Vengo del sitio de Notte Stays y quiero hospedarme.',
      waQ: '¡Hola! Vengo del sitio de Notte Stays. Mi pregunta: ',
      waDono: '¡Hola! Vengo del sitio de Notte Stays. Tengo un inmueble y me gustaría saber cómo funciona la administración.',
      note: 'Respuestas automáticas basadas en la información del sitio.',
      props: { nt: 'New Time', loft: 'Loft Residence', iloa: 'ILOA' }
    }
  };

  // Assuntos do menu inicial (ordem dos botões)
  var MENU = ['imoveis', 'valores', 'checkin', 'estacionamento', 'lazer', 'reservar', 'proprietarios', 'contato'];

  var NT = '/imoveis/new-time/', LOFT = '/imoveis/loft-residence/', ILOA = '/imoveis/iloa/';

  var BASE = [
    {
      id: 'imoveis', rel: ['valores', 'reservar', 'hospedes'],
      chip: { pt: 'Os imóveis', en: 'Our homes', es: 'Los alojamientos' },
      k: {
        pt: ['imoveis', 'quais imoveis', 'que imoveis', 'quais apartamentos', 'opcoes', 'onde ficam', 'unidades', 'acomodacoes', 'hospedagens'],
        en: ['properties', 'homes', 'apartments', 'options', 'listings', 'accommodations', 'what do you have'],
        es: ['propiedades', 'alojamientos', 'departamentos', 'apartamentos', 'opciones', 'donde quedan', 'que tienen']
      },
      a: {
        pt: 'Temos três endereços:\n• **New Time**, na Pajuçara (Maceió): studios no 13º andar, de frente para o mar, até 4 hóspedes. [Ver](' + NT + ')\n• **Loft Residence**, em Cruz das Almas (Maceió): studios com vista para o mar, até 3 hóspedes. [Ver](' + LOFT + ')\n• **ILOA Residence**, na Barra de São Miguel: apartamento de 3 quartos num condomínio-resort, até 6 hóspedes. [Ver](' + ILOA + ')',
        en: 'We have three locations:\n• **New Time**, in Pajuçara (Maceió): 13th-floor studios facing the sea, up to 4 guests. [See](' + NT + ')\n• **Loft Residence**, in Cruz das Almas (Maceió): sea-view studios, up to 3 guests. [See](' + LOFT + ')\n• **ILOA Residence**, in Barra de São Miguel: 3-bedroom apartment in a resort-style condo, up to 6 guests. [See](' + ILOA + ')',
        es: 'Tenemos tres direcciones:\n• **New Time**, en Pajuçara (Maceió): studios en el piso 13, frente al mar, hasta 4 huéspedes. [Ver](' + NT + ')\n• **Loft Residence**, en Cruz das Almas (Maceió): studios con vista al mar, hasta 3 huéspedes. [Ver](' + LOFT + ')\n• **ILOA Residence**, en Barra de São Miguel: departamento de 3 dormitorios en un condominio tipo resort, hasta 6 huéspedes. [Ver](' + ILOA + ')'
      }
    },
    {
      // resposta quando a pessoa só cita o imóvel ("e o Loft?")
      id: 'sobre', rel: ['valores', 'lazer', 'reservar'], k: {},
      a: {
        pt: {
          nt: 'O **New Time** fica na Pajuçara, em Maceió, de frente para o mar. Os studios 1303 e 1304 ficam no 13º andar, com vista lateral para o mar, cama queen e sofá-cama de casal (até 4 hóspedes). O prédio tem recepção 24 horas, rooftop com piscina de borda infinita, academia e três restaurantes. O studio 1302 abre em breve. [Ver a página](' + NT + ')',
          loft: 'O **Loft Residence** fica em Cruz das Almas, em Maceió, de frente para o mar. Os studios 607 (6º andar) e 807 (8º andar) têm janelas do piso ao teto com vista para o mar, cama de casal e sofá-cama (até 3 hóspedes). Os dois têm nota 5,0 e o selo Preferido dos hóspedes no Airbnb. [Ver a página](' + LOFT + ')',
          iloa: 'O **ILOA Residence** é um condomínio-resort na Barra de São Miguel, no litoral sul de Alagoas. O apartamento tem suíte de casal e dois quartos de solteiro, todos com ar-condicionado (até 6 hóspedes), cozinha completa e varanda com vista para o jardim. [Ver a página](' + ILOA + ')'
        },
        en: {
          nt: '**New Time** is in Pajuçara, Maceió, right on the seafront. Studios 1303 and 1304 are on the 13th floor, with a side sea view, a queen bed and a double sofa bed (up to 4 guests). The building has a 24-hour reception, a rooftop infinity pool, a gym and three restaurants. Studio 1302 opens soon. [See the page](' + NT + ')',
          loft: '**Loft Residence** is in Cruz das Almas, Maceió, facing the sea. Studios 607 (6th floor) and 807 (8th floor) have floor-to-ceiling windows with a sea view, a double bed and a sofa bed (up to 3 guests). Both are rated 5.0 and are Guest Favorites on Airbnb. [See the page](' + LOFT + ')',
          iloa: '**ILOA Residence** is a resort-style condo in Barra de São Miguel, on the south coast of Alagoas. The apartment has a double suite and two single bedrooms, all air-conditioned (up to 6 guests), a full kitchen and a balcony overlooking the garden. [See the page](' + ILOA + ')'
        },
        es: {
          nt: '**New Time** está en Pajuçara, Maceió, frente al mar. Los studios 1303 y 1304 están en el piso 13, con vista lateral al mar, cama queen y sofá cama doble (hasta 4 huéspedes). El edificio tiene recepción 24 horas, rooftop con piscina infinita, gimnasio y tres restaurantes. El studio 1302 abre pronto. [Ver la página](' + NT + ')',
          loft: '**Loft Residence** está en Cruz das Almas, Maceió, frente al mar. Los studios 607 (piso 6) y 807 (piso 8) tienen ventanales de piso a techo con vista al mar, cama doble y sofá cama (hasta 3 huéspedes). Los dos tienen nota 5,0 y el sello Favorito de los huéspedes en Airbnb. [Ver la página](' + LOFT + ')',
          iloa: '**ILOA Residence** es un condominio tipo resort en Barra de São Miguel, en la costa sur de Alagoas. El departamento tiene suite doble y dos dormitorios simples, todos con aire acondicionado (hasta 6 huéspedes), cocina completa y balcón con vista al jardín. [Ver la página](' + ILOA + ')'
        }
      }
    },
    {
      id: 'hospedes', rel: ['valores', 'criancas', 'reservar'], wa: true, extra: {
        pt: '\nO limite de hóspedes de cada imóvel deve ser respeitado. Em um caso específico, dá para conversar com a gente pelo WhatsApp.',
        en: '\nThe maximum number of guests for each home must be respected. For a specific case, you can talk to us on WhatsApp.',
        es: '\nSe debe respetar el máximo de huéspedes de cada alojamiento. Para un caso puntual, puedes hablar con nosotros por WhatsApp.'
      },
      k: {
        pt: ['quantas pessoas', 'quantos hospedes', 'hospedes', 'capacidade', 'cabem', 'quantos cabem', 'cabe 3', 'cabe 4', 'cabe 5', 'cabe 6', 'cabe 7', 'cabe mais', 'cabe quantas', 'camas', 'cama', 'quartos', 'quarto', 'dormir', 'sofa cama', 'casal', 'solteiro', 'pessoas:1', 'colchao', 'colchonete', 'pessoa a mais', 'mais uma pessoa', 'hospede extra'],
        en: ['how many people', 'how many guests', 'guests', 'capacity', 'beds', 'bed', 'bedrooms', 'bedroom', 'sleep', 'sofa bed', 'people:1', 'fit', 'mattress', 'extra person', 'extra guest', 'one more person'],
        es: ['cuantas personas', 'cuantos huespedes', 'huespedes', 'capacidad', 'caben', 'camas', 'cama', 'habitaciones', 'dormitorios', 'dormir', 'sofa cama', 'personas:1', 'colchon', 'persona extra', 'una persona mas', 'huesped extra']
      },
      a: {
        pt: {
          nt: 'No **New Time**, até 4 hóspedes: cama queen e sofá-cama de casal, num ambiente integrado.',
          loft: 'No **Loft Residence**, até 3 hóspedes: cama de casal e sofá-cama.',
          iloa: 'No **ILOA**, até 6 hóspedes: suíte de casal e dois quartos com camas de solteiro, todos com ar-condicionado. Os quartos são liberados de acordo com o número de hóspedes da reserva.'
        },
        en: {
          nt: 'At **New Time**, up to 4 guests: a queen bed and a double sofa bed in one open space.',
          loft: 'At **Loft Residence**, up to 3 guests: a double bed and a sofa bed.',
          iloa: 'At **ILOA**, up to 6 guests: a double suite and two bedrooms with single beds, all air-conditioned. Bedrooms are opened according to the number of guests in the booking.'
        },
        es: {
          nt: 'En **New Time**, hasta 4 huéspedes: cama queen y sofá cama doble, en un ambiente integrado.',
          loft: 'En **Loft Residence**, hasta 3 huéspedes: cama doble y sofá cama.',
          iloa: 'En **ILOA**, hasta 6 huéspedes: suite doble y dos dormitorios con camas simples, todos con aire acondicionado. Los dormitorios se habilitan según la cantidad de huéspedes de la reserva.'
        }
      }
    },
    {
      id: 'checkin', rel: ['chegada', 'bagagem', 'estacionamento'], wa: true,
      chip: { pt: 'Check-in e check-out', en: 'Check-in & check-out', es: 'Check-in y check-out' },
      k: {
        pt: ['check in', 'checkin', 'check out', 'checkout', 'horario:1', 'horarios:1', 'que horas:1', 'chegar cedo', 'chegar antes', 'entrar antes', 'entrar mais cedo', 'sair tarde', 'sair depois', 'sair mais tarde', 'entrada:1', 'saida:1'],
        en: ['check in', 'checkin', 'check out', 'checkout', 'what time:1', 'arrival time', 'early', 'late checkout', 'late check out', 'leave later', 'arrive earlier'],
        es: ['check in', 'checkin', 'check out', 'checkout', 'horario:1', 'que hora:1', 'a que hora:1', 'llegar temprano', 'llegar antes', 'entrar antes', 'salir tarde', 'salir mas tarde', 'llegada:1', 'salida:1']
      },
      a: {
        pt: 'Em todos os imóveis, o check-in é a partir das **15h** e o check-out até as **11h**. Dá para chegar a qualquer hora depois das 15h: no New Time e no ILOA a recepção funciona 24 horas, e no Loft Residence a porta abre com código.\n**Entrar mais cedo:** depende do dia. Se não houver hóspede saindo e a limpeza já estiver feita, a gente vê a disponibilidade.\n**Sair mais tarde:** às vezes dá para flexibilizar um pouco, conforme a situação, mas nem sempre é possível, porque normalmente há hóspede chegando.\nPara pedir, fale com a gente no WhatsApp.',
        en: 'In all our homes, check-in is from **3 p.m.** and check-out is by **11 a.m.** You can arrive any time after 3 p.m.: at New Time and ILOA the reception is open 24 hours, and at Loft Residence the door opens with a code.\n**Early check-in:** it depends on the day. If no guest is checking out and the cleaning is done, we check availability.\n**Late check-out:** we can sometimes be a little flexible, depending on the situation, but not always, because there is usually a guest arriving.\nTo ask, message us on WhatsApp.',
        es: 'En todos los alojamientos, el check-in es a partir de las **15 h** y el check-out hasta las **11 h**. Puedes llegar a cualquier hora después de las 15 h: en New Time e ILOA la recepción funciona las 24 horas, y en Loft Residence la puerta se abre con código.\n**Entrar antes:** depende del día. Si no hay huéspedes saliendo y la limpieza ya está hecha, vemos la disponibilidad.\n**Salir más tarde:** a veces se puede flexibilizar un poco, según la situación, pero no siempre, porque normalmente hay huéspedes llegando.\nPara pedirlo, escríbenos por WhatsApp.'
      }
    },
    {
      id: 'chegada', rel: ['checkin', 'estacionamento', 'localizacao'],
      k: {
        pt: ['documento', 'documentos', 'cpf', 'passaporte', 'chave', 'codigo', 'fechadura', 'cartao de acesso', 'recepcao', 'portaria', 'guarita', 'cadastro', 'como entro', 'como funciona a chegada', 'chegada', 'madrugada', 'de noite', 'a noite', 'chegar tarde', 'tarde da noite'],
        en: ['document', 'documents', 'id', 'passport', 'key', 'keys', 'code', 'lock', 'access card', 'reception', 'front desk', 'how do i get in', 'arrival', 'registration', 'late arrival', 'arrive late', 'at night', 'midnight'],
        es: ['documento', 'documentos', 'pasaporte', 'llave', 'llaves', 'codigo', 'cerradura', 'tarjeta de acceso', 'recepcion', 'porteria', 'registro', 'como entro', 'llegada', 'madrugada', 'de noche', 'llegar tarde']
      },
      a: {
        pt: {
          nt: 'Antes da chegada, envie pela conversa da reserva o nome completo e o CPF (ou passaporte) de todos os hóspedes e a placa do carro, se vier de carro. A partir das 15h, a recepção 24 horas do New Time faz o seu cadastro e entrega o cartão de acesso ao apartamento.',
          loft: 'Antes da chegada, envie pela conversa da reserva o nome completo e o CPF (ou passaporte) de todos os hóspedes e a placa do carro, se vier de carro. Na chegada, passe na guarita com os documentos de todos. A porta tem fechadura eletrônica: o código chega no dia do check-in, pela conversa da reserva, e no mesmo dia o seu nome e os seus dados já são enviados à portaria. Por isso, mesmo chegando à noite ou de madrugada, você entra sem depender de ninguém.',
          iloa: 'Antes da chegada, envie pela conversa da reserva o nome completo e o CPF (ou passaporte) de todos os hóspedes. A partir das 15h, vá à recepção principal do condomínio, aberta 24 horas, com os documentos de todos: lá você faz o check-in e recebe a chave.'
        },
        en: {
          nt: 'Before arrival, send the full name and CPF (or passport number) of every guest through the booking chat, plus your car plate if driving. From 3 p.m., the 24-hour reception at New Time registers you and gives you the access card to the apartment.',
          loft: 'Before arrival, send the full name and CPF (or passport number) of every guest through the booking chat, plus your car plate if driving. When you arrive, stop at the gatehouse with everyone\'s ID. The door has an electronic lock: the code is sent on check-in day through the booking chat, and on the same day your name and details are sent to the gatehouse. So even if you arrive at night or in the early hours, you can get in on your own.',
          iloa: 'Before arrival, send the full name and CPF (or passport number) of every guest through the booking chat. From 3 p.m., go to the condo\'s main reception, open 24 hours, with everyone\'s ID: you check in there and collect the key.'
        },
        es: {
          nt: 'Antes de llegar, envía por el chat de la reserva el nombre completo y el CPF (o pasaporte) de todos los huéspedes, y la patente del auto si vienes en auto. A partir de las 15 h, la recepción 24 horas de New Time hace tu registro y te entrega la tarjeta de acceso al departamento.',
          loft: 'Antes de llegar, envía por el chat de la reserva el nombre completo y el CPF (o pasaporte) de todos los huéspedes, y la patente del auto si vienes en auto. Al llegar, pasa por la garita con los documentos de todos. La puerta tiene cerradura electrónica: el código llega el día del check-in por el chat de la reserva, y ese mismo día tu nombre y tus datos se envían a la portería. Así, aunque llegues de noche o de madrugada, entras sin depender de nadie.',
          iloa: 'Antes de llegar, envía por el chat de la reserva el nombre completo y el CPF (o pasaporte) de todos los huéspedes. A partir de las 15 h, ve a la recepción principal del condominio, abierta las 24 horas, con los documentos de todos: allí haces el check-in y recibes la llave.'
        }
      }
    },
    {
      id: 'estacionamento', rel: ['chegada', 'localizacao', 'lazer'],
      chip: { pt: 'Estacionamento', en: 'Parking', es: 'Estacionamiento' },
      k: {
        pt: ['estacionamento', 'estacionar', 'garagem', 'vaga', 'vagas', 'carro', 'caminhonete', 'placa'],
        en: ['parking', 'park', 'garage', 'car', 'cars'],
        es: ['estacionamiento', 'estacionar', 'garaje', 'cochera', 'auto', 'coche', 'carro', 'patente']
      },
      a: {
        pt: {
          nt: 'Sim, **1 vaga** por apartamento, na garagem coberta, rotativa (sem vaga fixa); cabem caminhonetes. Informe a placa do carro com antecedência, pela conversa da reserva, para a liberação.',
          loft: 'Sim, **1 vaga fixa** por apartamento. O estacionamento fica na entrada do prédio; ao chegar de carro, passe primeiro na guarita.',
          iloa: 'Sim, **1 vaga** por apartamento, sem lugar fixo, dentro do condomínio e grátis.'
        },
        en: {
          nt: 'Yes, **1 space** per apartment in the covered garage, first come, first served (no assigned spot); pickup trucks fit. Send your car plate in advance through the booking chat so it can be cleared.',
          loft: 'Yes, **1 assigned space** per apartment. Parking is at the building entrance; when you arrive by car, stop at the gatehouse first.',
          iloa: 'Yes, **1 space** per apartment, with no assigned spot, inside the condo and free of charge.'
        },
        es: {
          nt: 'Sí, **1 lugar** por departamento en el garaje cubierto, rotativo (sin lugar fijo); caben camionetas. Envía la patente del auto con anticipación por el chat de la reserva para habilitarla.',
          loft: 'Sí, **1 lugar fijo** por departamento. El estacionamiento está en la entrada del edificio; si llegas en auto, pasa primero por la garita.',
          iloa: 'Sí, **1 lugar** por departamento, sin lugar fijo, dentro del condominio y gratis.'
        }
      }
    },
    {
      id: 'lazer', rel: ['restaurantes', 'criancas', 'localizacao'],
      chip: { pt: 'Piscina e lazer', en: 'Pool & amenities', es: 'Piscina y ocio' },
      k: {
        pt: ['piscina', 'piscinas', 'academia', 'sauna', 'hidromassagem', 'spa', 'salao de jogos', 'jogos', 'lazer', 'rooftop', 'playground', 'lavanderia', 'beach tennis', 'churrasqueira', 'gourmet', 'area comum', 'areas comuns', 'estrutura'],
        en: ['pool', 'pools', 'gym', 'sauna', 'hot tub', 'jacuzzi', 'spa', 'game room', 'amenities', 'rooftop', 'playground', 'laundry', 'barbecue', 'bbq', 'facilities', 'beach tennis'],
        es: ['piscina', 'piscinas', 'pileta', 'gimnasio', 'sauna', 'jacuzzi', 'hidromasaje', 'spa', 'sala de juegos', 'juegos', 'rooftop', 'lavanderia', 'parrilla', 'asador', 'instalaciones', 'areas comunes', 'beach tennis']
      },
      a: {
        pt: {
          nt: 'Incluídos na estadia: piscina de borda infinita no rooftop (8h às 19h), academia (7h às 22h), salão de jogos, playground e brinquedoteca (8h às 20h). Pagos à parte, direto ao prédio: sauna e hidromassagem (9h às 21h; a hidromassagem precisa de agendamento), lavanderia e adega. Nas áreas comuns é obrigatório usar a pulseira do condomínio.',
          loft: 'No condomínio: piscina com vista para o mar, academia, lavanderia (paga à parte), espaço gourmet e mercadinho.',
          iloa: 'No condomínio: piscinas (com área para as crianças), quadra de beach tennis, restaurante, conveniência 24 horas, segurança 24 horas e muita área verde.'
        },
        en: {
          nt: 'Included in your stay: rooftop infinity pool (8 a.m. to 7 p.m.), gym (7 a.m. to 10 p.m.), game room, playground and kids room (8 a.m. to 8 p.m.). Paid separately to the building: sauna and hot tub (9 a.m. to 9 p.m.; the hot tub needs booking), laundry and wine cellar. The building ID wristband is required in common areas.',
          loft: 'In the building: sea-view pool, gym, laundry (paid separately), gourmet area and mini market.',
          iloa: 'In the condo: pools (with a kids area), beach tennis court, restaurant, 24-hour convenience store, 24-hour security and lots of green space.'
        },
        es: {
          nt: 'Incluidos en la estadía: piscina infinita en el rooftop (8 a 19 h), gimnasio (7 a 22 h), sala de juegos, playground y juegoteca (8 a 20 h). Se pagan aparte, directo al edificio: sauna e hidromasaje (9 a 21 h; el hidromasaje requiere reserva), lavandería y cava de vinos. En las áreas comunes es obligatorio usar la pulsera del condominio.',
          loft: 'En el edificio: piscina con vista al mar, gimnasio, lavandería (paga aparte), espacio gourmet y minimercado.',
          iloa: 'En el condominio: piscinas (con área para niños), cancha de beach tennis, restaurante, minimercado 24 horas, seguridad 24 horas y mucho verde.'
        }
      }
    },
    {
      id: 'cozinha', rel: ['restaurantes', 'wifi', 'enxoval'],
      k: {
        pt: ['cozinha', 'cozinhar', 'fogao', 'geladeira', 'micro ondas', 'microondas', 'panela', 'panelas', 'cafeteira', 'utensilios', 'liquidificador'],
        en: ['kitchen', 'cook', 'cooking', 'stove', 'fridge', 'refrigerator', 'microwave', 'coffee maker', 'pans', 'utensils'],
        es: ['cocina', 'cocinar', 'heladera', 'nevera', 'refrigerador', 'microondas', 'cafetera', 'ollas', 'utensilios']
      },
      a: {
        pt: {
          nt: 'Sim, cozinha completa: fogão de indução (as panelas certas já estão no apartamento), geladeira, micro-ondas, cafeteira e utensílios.',
          loft: 'Sim, cozinha equipada: geladeira, fogão de 4 bocas, micro-ondas, liquidificador, sanduicheira e utensílios.',
          iloa: 'Sim, cozinha completa: fogão de indução, geladeira, micro-ondas, cafeteira, liquidificador e utensílios.'
        },
        en: {
          nt: 'Yes, a full kitchen: induction stove (the right pans are in the apartment), fridge, microwave, coffee maker and utensils.',
          loft: 'Yes, an equipped kitchen: fridge, 4-burner stove, microwave, blender, sandwich maker and utensils.',
          iloa: 'Yes, a full kitchen: induction stove, fridge, microwave, coffee maker, blender and utensils.'
        },
        es: {
          nt: 'Sí, cocina completa: anafe de inducción (las ollas adecuadas ya están en el departamento), heladera, microondas, cafetera y utensilios.',
          loft: 'Sí, cocina equipada: heladera, cocina de 4 hornallas, microondas, licuadora, sandwichera y utensilios.',
          iloa: 'Sí, cocina completa: anafe de inducción, heladera, microondas, cafetera, licuadora y utensilios.'
        }
      }
    },
    {
      id: 'wifi', rel: ['cozinha', 'enxoval', 'lazer'],
      k: {
        pt: ['wifi', 'wi fi', 'internet', 'ar condicionado', 'ar', 'tv', 'televisao', 'smart tv', 'climatizado', 'netflix', 'blackout'],
        en: ['wifi', 'wi fi', 'internet', 'air conditioning', 'air conditioner', 'ac', 'tv', 'television', 'netflix'],
        es: ['wifi', 'wi fi', 'internet', 'aire acondicionado', 'aire', 'tv', 'television', 'tele', 'netflix']
      },
      a: {
        pt: {
          nt: 'Sim: Wi-Fi, ar-condicionado, smart TV e cortinas blackout. A senha do Wi-Fi vai pela conversa da reserva.',
          loft: 'Sim: Wi-Fi, ar-condicionado e TV. A senha do Wi-Fi vai pela conversa da reserva.',
          iloa: 'Sim: Wi-Fi, TV e ar-condicionado em todos os quartos. A senha do Wi-Fi vai pela conversa da reserva.'
        },
        en: {
          nt: 'Yes: Wi-Fi, air conditioning, smart TV and blackout curtains. The Wi-Fi password is sent in the booking chat.',
          loft: 'Yes: Wi-Fi, air conditioning and TV. The Wi-Fi password is sent in the booking chat.',
          iloa: 'Yes: Wi-Fi, TV and air conditioning in every bedroom. The Wi-Fi password is sent in the booking chat.'
        },
        es: {
          nt: 'Sí: wifi, aire acondicionado, smart TV y cortinas blackout. La contraseña del wifi va por el chat de la reserva.',
          loft: 'Sí: wifi, aire acondicionado y TV. La contraseña del wifi va por el chat de la reserva.',
          iloa: 'Sí: wifi, TV y aire acondicionado en todos los dormitorios. La contraseña del wifi va por el chat de la reserva.'
        }
      }
    },
    {
      id: 'enxoval', rel: ['itens', 'eletro', 'cozinha'], wa: true,
      k: {
        pt: ['toalha', 'toalhas', 'roupa de cama', 'roupas de cama', 'lencol', 'lencois', 'enxoval', 'limpeza', 'faxina', 'travesseiro', 'limpo'],
        en: ['towel', 'towels', 'linen', 'linens', 'sheets', 'bedding', 'cleaning', 'housekeeping', 'clean', 'pillow'],
        es: ['toalla', 'toallas', 'ropa de cama', 'sabanas', 'limpieza', 'almohada', 'limpio']
      },
      a: {
        pt: 'Sim, roupas de cama e toalhas estão incluídas, e o imóvel passa por limpeza profissional a cada estadia, com enxoval trocado. Durante a estadia, dá para pedir limpeza extra com troca de enxoval, paga pelo hóspede: R$ 160 no New Time e R$ 130 no Loft Residence; no ILOA, consulte o valor pelo WhatsApp.',
        en: 'Yes, bed linen and towels are included, and every home is professionally cleaned before each stay, with fresh linen. During your stay you can request an extra cleaning with fresh linen, paid by the guest: R$ 160 at New Time and R$ 130 at Loft Residence; for ILOA, ask us on WhatsApp.',
        es: 'Sí, la ropa de cama y las toallas están incluidas, y el alojamiento recibe limpieza profesional en cada estadía, con ropa de cama cambiada. Durante la estadía puedes pedir una limpieza extra con cambio de ropa de cama, pagada por el huésped: R$ 160 en New Time y R$ 130 en Loft Residence; para ILOA, consulta el valor por WhatsApp.'
      }
    },
    {
      id: 'valores', rel: ['reservar', 'cancelamento', 'imoveis'], wa: true,
      chip: { pt: 'Valores e datas', en: 'Prices & dates', es: 'Precios y fechas' },
      k: {
        pt: ['preco', 'precos', 'valor', 'valores', 'quanto custa', 'quanto fica', 'quanto sai', 'quanto e', 'diaria', 'diarias', 'custo', 'orcamento', 'disponibilidade', 'disponivel', 'datas livres', 'tarifa', 'promocao', 'pacote', 'reveillon', 'carnaval', 'feriado'],
        en: ['price', 'prices', 'cost', 'rate', 'rates', 'how much', 'nightly', 'per night', 'availability', 'available', 'quote', 'deal', 'new year'],
        es: ['precio', 'precios', 'cuanto cuesta', 'cuanto sale', 'cuanto es', 'valor', 'tarifa', 'costo', 'disponibilidad', 'disponible', 'cotizacion', 'presupuesto', 'fechas libres', 'promocion', 'ano nuevo', 'carnaval', 'feriado']
      },
      a: {
        pt: 'Os valores mudam conforme a data, a temporada e o número de hóspedes, então não passo preço por aqui para não te informar errado. Para ver o valor exato e as datas livres, abra o imóvel no Airbnb ou na Booking pelos botões de reserva ([New Time](' + NT + '#reservar), [Loft Residence](' + LOFT + '#reservar), [ILOA](' + ILOA + '#reservar)) ou peça pelo WhatsApp.',
        en: 'Prices change with the dates, the season and the number of guests, so I don\'t quote prices here to avoid getting it wrong. To see the exact price and free dates, open the home on Airbnb or Booking using the booking buttons ([New Time](' + NT + '#reservar), [Loft Residence](' + LOFT + '#reservar), [ILOA](' + ILOA + '#reservar)) or ask us on WhatsApp.',
        es: 'Los precios cambian según la fecha, la temporada y la cantidad de huéspedes, así que no doy precios por aquí para no informarte mal. Para ver el valor exacto y las fechas libres, abre el alojamiento en Airbnb o Booking con los botones de reserva ([New Time](' + NT + '#reservar), [Loft Residence](' + LOFT + '#reservar), [ILOA](' + ILOA + '#reservar)) o pregúntanos por WhatsApp.'
      }
    },
    {
      id: 'cancelamento', rel: ['reservar', 'valores'], wa: true,
      k: {
        pt: ['cancelar:3', 'cancelamento:3', 'reembolso:3', 'devolucao', 'estorno', 'desistir'],
        en: ['cancel:3', 'cancellation:3', 'refund:3', 'cancelled'],
        es: ['cancelar:3', 'cancelacion:3', 'reembolso:3', 'devolucion']
      },
      a: {
        pt: 'Em todos os imóveis, o cancelamento é **grátis até 14 dias antes do check-in**. Na Booking também há uma tarifa não reembolsável, mais barata.\nEstadias de 28 noites ou mais seguem uma regra própria da plataforma. Nas reservas feitas direto com a gente, valem as mesmas regras. A regra exata de cada reserva aparece no anúncio antes de você confirmar.',
        en: 'In all our homes, cancellation is **free up to 14 days before check-in**. Booking also offers a cheaper non-refundable rate.\nStays of 28 nights or more follow a separate platform rule. Direct bookings with us follow the same rules. The exact policy for each booking is shown on the listing before you confirm.',
        es: 'En todos los alojamientos, la cancelación es **gratis hasta 14 días antes del check-in**. En Booking también hay una tarifa no reembolsable, más barata.\nLas estadías de 28 noches o más siguen una regla propia de la plataforma. En las reservas hechas directo con nosotros valen las mismas reglas. La regla exacta de cada reserva aparece en el anuncio antes de confirmar.'
      }
    },
    {
      id: 'reservar', rel: ['valores', 'pagamento', 'cancelamento'], wa: true,
      chip: { pt: 'Como reservar', en: 'How to book', es: 'Cómo reservar' },
      k: {
        pt: ['reservar', 'reserva', 'reservo', 'fazer a reserva', 'alugar', 'airbnb', 'booking'],
        en: ['book', 'booking', 'reserve', 'reservation', 'airbnb', 'rent'],
        es: ['reservar', 'reserva', 'alquilar', 'airbnb', 'booking']
      },
      a: {
        pt: 'Reservando **direto com a gente**, você paga **10% menos**. Escolha as datas no calendário da página do imóvel, [New Time](' + NT + '#reservar), [Loft Residence](' + LOFT + '#reservar) ou [ILOA](' + ILOA + '#reservar), e mande o pedido pelo WhatsApp. Depois da nossa confirmação, o pagamento é por Pix, direto na conta do proprietário, e você recebe o contrato de locação por temporada.\nSe preferir, também dá para reservar pelo **Airbnb** ou pela **Booking**, nos botões das mesmas páginas (o ILOA, por enquanto, só no Airbnb).',
        en: 'Booking **directly with us** costs **10% less**. Pick your dates on the calendar of the property page, [New Time](' + NT + '#reservar), [Loft Residence](' + LOFT + '#reservar) or [ILOA](' + ILOA + '#reservar), and send the request on WhatsApp. Once we confirm, you pay by Pix straight to the owner\'s account and receive the short-term rental contract.\nIf you prefer, you can also book on **Airbnb** or **Booking** with the buttons on the same pages (ILOA is on Airbnb only for now).',
        es: 'Reservando **directo con nosotros**, pagas **10% menos**. Elige las fechas en el calendario de la página del alojamiento, [New Time](' + NT + '#reservar), [Loft Residence](' + LOFT + '#reservar) o [ILOA](' + ILOA + '#reservar), y envía el pedido por WhatsApp. Después de nuestra confirmación, el pago es por Pix, directo a la cuenta del propietario, y recibes el contrato de alquiler por temporada.\nSi prefieres, también puedes reservar por **Airbnb** o por **Booking**, con los botones de las mismas páginas (ILOA, por ahora, solo en Airbnb).'
      }
    },
    {
      id: 'fumar', rel: ['regras'],
      k: {
        pt: ['fumar', 'fumo', 'cigarro', 'fumante', 'narguile', 'vape'],
        en: ['smoke', 'smoking', 'cigarette', 'cigarettes', 'vape'],
        es: ['fumar', 'cigarro', 'cigarrillo', 'fumador', 'vapear']
      },
      a: {
        pt: { nt: 'Não é permitido fumar no apartamento nem nas áreas comuns. Na sacada, pode.', loft: 'Não é permitido fumar no apartamento nem nas áreas comuns.', iloa: 'Não é permitido fumar no apartamento nem nas áreas comuns. Na varanda, pode.' },
        en: { nt: 'No smoking inside the apartment or in common areas. Smoking is allowed on the balcony.', loft: 'No smoking inside the apartment or in common areas.', iloa: 'No smoking inside the apartment or in common areas. Smoking is allowed on the balcony.' },
        es: { nt: 'No se permite fumar en el departamento ni en las áreas comunes. En el balcón, sí.', loft: 'No se permite fumar en el departamento ni en las áreas comunes.', iloa: 'No se permite fumar en el departamento ni en las áreas comunes. En el balcón, sí.' }
      }
    },
    {
      id: 'regras', rel: ['visitas', 'pets', 'fumar'], extra: {
        pt: '\nEm todos os imóveis: festas proibidas e não aceitamos animais de estimação.',
        en: '\nIn all our homes: no parties and no pets.',
        es: '\nEn todos los alojamientos: fiestas prohibidas y no aceptamos mascotas.'
      },
      k: {
        pt: ['regras', 'regra', 'silencio', 'barulho', 'pulseira', 'normas'],
        en: ['rules', 'house rules', 'quiet hours', 'noise', 'wristband'],
        es: ['reglas', 'normas', 'silencio', 'ruido', 'pulsera']
      },
      a: {
        pt: {
          nt: 'Silêncio das 22h às 7h; pulseira de identificação do condomínio nas áreas comuns; fumar só na sacada; maleiro só no dia do check-in; reposição do cartão de acesso perdido: R$ 50. Danos ao apartamento ou aos objetos são de responsabilidade do hóspede.',
          loft: 'Silêncio das 22h às 7h; não é permitido fumar no apartamento nem nas áreas comuns; documentos de todos os hóspedes na guarita. Danos ao apartamento ou aos objetos são de responsabilidade do hóspede.',
          iloa: 'Silêncio das 22h às 7h; fumar só na varanda; os quartos são liberados de acordo com o número de hóspedes. Danos ao apartamento ou aos objetos são de responsabilidade do hóspede.'
        },
        en: {
          nt: 'Quiet hours 10 p.m. to 7 a.m.; building ID wristband in common areas; smoking only on the balcony; luggage room on check-in day only; lost access card: R$ 50. Guests are responsible for any damage to the apartment or its contents.',
          loft: 'Quiet hours 10 p.m. to 7 a.m.; no smoking inside or in common areas; every guest shows ID at the gatehouse. Guests are responsible for any damage to the apartment or its contents.',
          iloa: 'Quiet hours 10 p.m. to 7 a.m.; smoking only on the balcony; bedrooms are opened according to the number of guests. Guests are responsible for any damage to the apartment or its contents.'
        },
        es: {
          nt: 'Silencio de 22 a 7 h; pulsera del condominio en las áreas comunes; fumar solo en el balcón; guardaequipaje solo el día del check-in; reposición de la tarjeta de acceso perdida: R$ 50. Los daños al departamento o a los objetos son responsabilidad del huésped.',
          loft: 'Silencio de 22 a 7 h; no se permite fumar en el departamento ni en las áreas comunes; documentos de todos los huéspedes en la garita. Los daños al departamento o a los objetos son responsabilidad del huésped.',
          iloa: 'Silencio de 22 a 7 h; fumar solo en el balcón; los dormitorios se habilitan según la cantidad de huéspedes. Los daños al departamento o a los objetos son responsabilidad del huésped.'
        }
      }
    },
    {
      id: 'localizacao', rel: ['restaurantes', 'estacionamento', 'lazer'],
      k: {
        pt: ['onde fica', 'localizacao', 'endereco', 'praia', 'mar:1', 'distancia', 'longe', 'perto:1', 'bairro', 'mapa', 'pe na areia', 'frente mar', 'vista:1', 'piscinas naturais', 'jangada'],
        en: ['where is', 'where:1', 'location', 'address', 'beach', 'sea:1', 'ocean', 'distance', 'far', 'near:1', 'close to', 'neighborhood', 'map', 'view:1', 'natural pools'],
        es: ['donde queda', 'donde esta', 'donde:1', 'ubicacion', 'direccion', 'playa', 'mar:1', 'distancia', 'lejos', 'cerca:1', 'barrio', 'mapa', 'vista:1', 'piscinas naturales']
      },
      a: {
        pt: {
          nt: 'O New Time fica na Avenida Doutor Antônio Gouveia, 23, na Pajuçara, em Maceió, de frente para o mar. Da orla saem as jangadas para as piscinas naturais da Pajuçara, e o calçadão, os quiosques e os coqueiros ficam a poucos passos do prédio.',
          loft: 'O Loft Residence fica na Rua João Canúto da Silva, 21, em Cruz das Almas, Maceió, de frente para a praia. Fica perto do Parque Shopping Maceió e a poucos minutos da Ponta Verde e da Pajuçara.',
          iloa: 'O ILOA Residence fica na Barra de São Miguel, no litoral sul de Alagoas. A Praia da Barra fica a 2,5 km, a Praia do Francês a 8 km e a do Gunga a 10 km.'
        },
        en: {
          nt: 'New Time is at Avenida Doutor Antônio Gouveia, 23, Pajuçara, Maceió, right on the seafront. The rafts to the Pajuçara natural pools leave from this beach, and the boardwalk, kiosks and palm trees are a few steps from the building.',
          loft: 'Loft Residence is at Rua João Canúto da Silva, 21, Cruz das Almas, Maceió, facing the beach. It is close to Parque Shopping Maceió and a few minutes from Ponta Verde and Pajuçara.',
          iloa: 'ILOA Residence is in Barra de São Miguel, on the south coast of Alagoas. Barra beach is 2.5 km away, Praia do Francês 8 km and Gunga 10 km.'
        },
        es: {
          nt: 'New Time está en la Avenida Doutor Antônio Gouveia, 23, Pajuçara, Maceió, frente al mar. De esta playa salen las jangadas a las piscinas naturales de Pajuçara, y la rambla, los paradores y los cocoteros están a pocos pasos del edificio.',
          loft: 'Loft Residence está en la Rua João Canúto da Silva, 21, Cruz das Almas, Maceió, frente a la playa. Queda cerca del Parque Shopping Maceió y a pocos minutos de Ponta Verde y Pajuçara.',
          iloa: 'ILOA Residence está en Barra de São Miguel, en la costa sur de Alagoas. La playa de Barra queda a 2,5 km, Praia do Francês a 8 km y Gunga a 10 km.'
        }
      }
    },
    {
      id: 'restaurantes', rel: ['lazer', 'localizacao', 'cozinha'],
      k: {
        pt: ['restaurante', 'restaurantes', 'comer', 'comida', 'cafe da manha', 'almoco', 'jantar', 'mercado', 'mercadinho', 'padaria', 'confeitaria', 'bar'],
        en: ['restaurant', 'restaurants', 'eat', 'food', 'breakfast', 'lunch', 'dinner', 'market', 'grocery', 'supermarket', 'bar'],
        es: ['restaurante', 'restaurantes', 'comer', 'comida', 'desayuno', 'almuerzo', 'cena', 'mercado', 'supermercado', 'bar']
      },
      a: {
        pt: {
          nt: 'No próprio New Time: **Ruca Confeitaria** e **Anamá** (cozinha nordestina, do café da manhã ao jantar) no térreo, e o **Toá Rooftop** no 15º andar. O prédio também tem um mercado autônomo para o básico do dia. São casas independentes, com cobrança à parte.',
          loft: 'O condomínio tem mercadinho e espaço gourmet, e a cozinha do studio é equipada.',
          iloa: 'O condomínio tem restaurante e conveniência 24 horas, e o apartamento tem cozinha completa.'
        },
        en: {
          nt: 'Right in New Time: **Ruca Confeitaria** and **Anamá** (northeastern Brazilian food, from breakfast to dinner) on the ground floor, and **Toá Rooftop** on the 15th floor. The building also has a self-service market for daily basics. They are independent businesses, paid separately.',
          loft: 'The building has a mini market and a gourmet area, and the studio kitchen is fully equipped.',
          iloa: 'The condo has a restaurant and a 24-hour convenience store, and the apartment has a full kitchen.'
        },
        es: {
          nt: 'En el mismo New Time: **Ruca Confeitaria** y **Anamá** (cocina del nordeste brasileño, del desayuno a la cena) en la planta baja, y **Toá Rooftop** en el piso 15. El edificio también tiene un mercado autoservicio para lo básico. Son locales independientes, con cobro aparte.',
          loft: 'El edificio tiene minimercado y espacio gourmet, y la cocina del studio está equipada.',
          iloa: 'El condominio tiene restaurante y minimercado 24 horas, y el departamento tiene cocina completa.'
        }
      }
    },
    {
      id: 'bagagem', rel: ['checkin', 'chegada'],
      k: {
        pt: ['mala', 'malas', 'bagagem', 'bagagens', 'maleiro', 'guardar as malas'],
        en: ['luggage', 'bags', 'baggage', 'suitcase', 'suitcases'],
        es: ['maleta', 'maletas', 'equipaje', 'valija', 'valijas']
      },
      a: {
        pt: { nt: 'O New Time tem maleiro para guardar as malas **no dia do check-in**. No dia do check-out ele não pode ser usado.', loft: 'No Loft Residence não é possível deixar as malas, nem no dia do check-in nem no dia do check-out.', iloa: 'Dá para deixar as malas **no dia do check-in**. No dia do check-out, não.' },
        en: { nt: 'New Time has a luggage room you can use **on check-in day**. It cannot be used on check-out day.', loft: 'At Loft Residence luggage cannot be left, neither on check-in day nor on check-out day.', iloa: 'You can drop off your luggage **on check-in day**, but not on check-out day.' },
        es: { nt: 'New Time tiene guardaequipaje para usar **el día del check-in**. El día del check-out no se puede usar.', loft: 'En Loft Residence no se puede dejar el equipaje, ni el día del check-in ni el día del check-out.', iloa: 'Puedes dejar el equipaje **el día del check-in**. El día del check-out, no.' }
      }
    },
    {
      id: 'criancas', rel: ['hospedes', 'lazer'],
      k: {
        pt: ['crianca', 'criancas', 'bebe', 'berco', 'filho', 'filhos', 'familia', 'infantil', 'brinquedoteca'],
        en: ['kids', 'kid', 'children', 'child', 'baby', 'crib', 'cot', 'family', 'toddler'],
        es: ['nino', 'ninos', 'nina', 'ninas', 'bebe', 'cuna', 'familia', 'hijos', 'infantil']
      },
      a: {
        pt: { nt: 'O New Time tem playground e brinquedoteca (8h às 20h) e o studio recebe até 4 hóspedes. Não temos berço.', loft: 'O studio do Loft Residence recebe até 3 hóspedes. Não temos berço.', iloa: 'O ILOA é ideal para famílias: 3 quartos, complexo de piscinas com área para as crianças e muita área verde. Não temos berço.' },
        en: { nt: 'New Time has a playground and a kids room (8 a.m. to 8 p.m.), and the studio sleeps up to 4. We do not have cribs.', loft: 'The Loft Residence studio sleeps up to 3. We do not have cribs.', iloa: 'ILOA is great for families: 3 bedrooms, pools with a kids area and lots of green space. We do not have cribs.' },
        es: { nt: 'New Time tiene playground y juegoteca (8 a 20 h), y el studio recibe hasta 4 huéspedes. No tenemos cuna.', loft: 'El studio del Loft Residence recibe hasta 3 huéspedes. No tenemos cuna.', iloa: 'ILOA es ideal para familias: 3 dormitorios, piscinas con área para niños y mucho verde. No tenemos cuna.' }
      }
    },
    {
      id: 'pets', rel: ['regras', 'imoveis'],
      k: {
        pt: ['pet:3', 'pets:3', 'cachorro:3', 'cachorrinho:3', 'cao:3', 'gato:3', 'animal:3', 'animais:3'],
        en: ['pet:3', 'pets:3', 'dog:3', 'dogs:3', 'cat:3', 'cats:3', 'animal:3', 'animals:3'],
        es: ['mascota:3', 'mascotas:3', 'perro:3', 'perrito:3', 'gato:3', 'animal:3', 'animales:3']
      },
      a: {
        pt: 'Não aceitamos animais de estimação em nenhum dos imóveis.',
        en: 'Pets are not allowed in any of our homes.',
        es: 'No aceptamos mascotas en ninguno de los alojamientos.'
      }
    },
    {
      id: 'festas', rel: ['visitas', 'regras'],
      k: {
        pt: ['festa:3', 'festas:3', 'aniversario', 'evento', 'eventos', 'comemoracao', 'confraternizacao'],
        en: ['party:3', 'parties:3', 'birthday', 'event', 'events', 'celebration'],
        es: ['fiesta:3', 'fiestas:3', 'cumpleanos', 'evento', 'eventos', 'celebracion']
      },
      a: {
        pt: 'Festas e eventos são proibidos em todos os imóveis. Visitas são aceitas, com documento de identidade para verificação e registro: no New Time, na recepção do edifício; no Loft Residence, na portaria; no ILOA, na recepção principal do condomínio.',
        en: 'Parties and events are not allowed in any of our homes. Visitors are welcome with a photo ID for verification and registration: at New Time, at the building reception; at Loft Residence, at the gatehouse; at ILOA, at the condo\'s main reception.',
        es: 'Las fiestas y los eventos están prohibidos en todos los alojamientos. Las visitas se aceptan, con documento de identidad para verificación y registro: en New Time, en la recepción del edificio; en Loft Residence, en la portería; en ILOA, en la recepción principal del condominio.'
      }
    },
    {
      id: 'visitas', rel: ['festas', 'regras', 'chegada'], wa: true,
      k: {
        pt: ['visita:3', 'visitas:3', 'visitante', 'visitantes', 'receber amigos', 'receber alguem', 'trazer amigos'],
        en: ['visitor:3', 'visitors:3', 'visit:3', 'guests over', 'bring friends', 'friends over'],
        es: ['visita:3', 'visitas:3', 'visitante', 'visitantes', 'recibir amigos', 'traer amigos']
      },
      a: {
        pt: { nt: 'Sim, visitas são aceitas, mediante documento de identidade para verificação e registro na recepção do edifício. Festas são proibidas.', loft: 'Sim, visitas são aceitas, mediante documento de identidade para verificação e registro na portaria. Festas são proibidas.', iloa: 'Sim, visitas são aceitas, mediante documento de identidade para verificação e registro na recepção principal do condomínio. Festas são proibidas.' },
        en: { nt: 'Yes, visitors are welcome with a photo ID for verification and registration at the building reception. Parties are not allowed.', loft: 'Yes, visitors are welcome with a photo ID for verification and registration at the gatehouse. Parties are not allowed.', iloa: 'Yes, visitors are welcome with a photo ID for verification and registration at the condo\'s main reception. Parties are not allowed.' },
        es: { nt: 'Sí, las visitas se aceptan con documento de identidad para verificación y registro en la recepción del edificio. Las fiestas están prohibidas.', loft: 'Sí, las visitas se aceptan con documento de identidad para verificación y registro en la portería. Las fiestas están prohibidas.', iloa: 'Sí, las visitas se aceptan con documento de identidad para verificación y registro en la recepción principal del condominio. Las fiestas están prohibidas.' }
      }
    },
    {
      id: 'pagamento', rel: ['reservar', 'cancelamento', 'valores'], wa: true,
      k: {
        pt: ['pagamento:3', 'pagar:3', 'pix:3', 'pago', 'reserva direta', 'direto com voce', 'por fora', 'sem plataforma', 'transferencia', 'deposito'],
        en: ['payment:3', 'pay:3', 'pix:3', 'book direct', 'direct booking', 'bank transfer', 'outside airbnb'],
        es: ['pago:3', 'pagar:3', 'pix:3', 'reserva directa', 'directo con ustedes', 'por fuera', 'transferencia', 'deposito']
      },
      a: {
        pt: 'Na **reserva direta**, que sai **10% mais barata**, você escolhe as datas no calendário da página do imóvel e manda o pedido pelo WhatsApp. Depois da nossa confirmação, o pagamento é por **Pix, direto na conta do proprietário**, e você recebe o contrato de locação por temporada. Reservando pelo Airbnb ou pela Booking, o pagamento é feito na própria plataforma.',
        en: 'With a **direct booking**, which is **10% cheaper**, you pick your dates on the property page calendar and send the request on WhatsApp. Once we confirm, you pay by **Pix straight to the owner\'s account** and receive the short-term rental contract. If you book on Airbnb or Booking, payment is made on the platform itself.',
        es: 'En la **reserva directa**, que sale **10% más barata**, eliges las fechas en el calendario de la página del alojamiento y envías el pedido por WhatsApp. Después de nuestra confirmación, el pago es por **Pix, directo a la cuenta del propietario**, y recibes el contrato de alquiler por temporada. Si reservas por Airbnb o por Booking, el pago se hace en la propia plataforma.'
      }
    },
    {
      id: 'transfer', rel: ['localizacao', 'estacionamento'],
      k: {
        pt: ['aeroporto:3', 'transfer:3', 'translado:3', 'traslado:3', 'buscar no aeroporto', 'busca no aeroporto'],
        en: ['airport:3', 'transfer:3', 'shuttle:3', 'pick up', 'pickup'],
        es: ['aeropuerto:3', 'traslado:3', 'transfer:3', 'buscar en el aeropuerto']
      },
      a: {
        pt: { nt: 'O aeroporto fica a cerca de **30 minutos** de carro, sem trânsito. Não fazemos busca no aeroporto. **No dia do check-out**, dá para verificar com a recepção do edifício um transfer do New Time até o aeroporto, conforme a disponibilidade de táxis e transportes.', loft: 'O aeroporto fica a cerca de **30 minutos** de carro, sem trânsito. No Loft Residence não temos transfer nem busca no aeroporto.', iloa: 'O aeroporto fica a cerca de **50 minutos** de carro, sem trânsito. No ILOA não temos transfer nem busca no aeroporto.' },
        en: { nt: 'The airport is about **30 minutes** away by car, without traffic. We do not offer airport pickup. **On check-out day**, you can ask the building reception about a transfer from New Time to the airport, depending on the availability of taxis and transport.', loft: 'The airport is about **30 minutes** away by car, without traffic. At Loft Residence there is no transfer or airport pickup.', iloa: 'The airport is about **50 minutes** away by car, without traffic. At ILOA there is no transfer or airport pickup.' },
        es: { nt: 'El aeropuerto queda a unos **30 minutos** en auto, sin tránsito. No hacemos traslado desde el aeropuerto. **El día del check-out**, se puede consultar con la recepción del edificio un traslado de New Time al aeropuerto, según la disponibilidad de taxis y transportes.', loft: 'El aeropuerto queda a unos **30 minutos** en auto, sin tránsito. En Loft Residence no tenemos traslado ni búsqueda en el aeropuerto.', iloa: 'El aeropuerto queda a unos **50 minutos** en auto, sin tránsito. En ILOA no tenemos traslado ni búsqueda en el aeropuerto.' }
      }
    },
    {
      id: 'seguranca', rel: ['chegada', 'localizacao'],
      k: {
        pt: ['seguranca', 'seguro', 'vigilancia', 'perigoso', 'tranquilo'],
        en: ['safe', 'safety', 'security', 'dangerous'],
        es: ['seguridad', 'seguro', 'peligroso', 'tranquilo']
      },
      a: {
        pt: { nt: 'O New Time tem recepção e segurança 24 horas, e o acesso ao apartamento é feito com cartão.', loft: 'No Loft Residence, a entrada passa pela guarita, que confere os documentos de todos os hóspedes, e a porta do studio tem fechadura eletrônica.', iloa: 'O ILOA Residence tem segurança 24 horas e recepção principal aberta 24 horas.' },
        en: { nt: 'New Time has 24-hour reception and security, and the apartment is opened with an access card.', loft: 'At Loft Residence, everyone goes through the gatehouse, which checks every guest\'s ID, and the studio door has an electronic lock.', iloa: 'ILOA Residence has 24-hour security and a main reception open 24 hours.' },
        es: { nt: 'New Time tiene recepción y seguridad 24 horas, y el departamento se abre con tarjeta de acceso.', loft: 'En Loft Residence, la entrada pasa por la garita, que controla los documentos de todos los huéspedes, y la puerta del studio tiene cerradura electrónica.', iloa: 'ILOA Residence tiene seguridad 24 horas y recepción principal abierta las 24 horas.' }
      }
    },
    {
      id: 'avaliacoes', rel: ['imoveis', 'reservar'],
      k: {
        pt: ['avaliacao', 'avaliacoes', 'nota', 'notas', 'comentarios', 'estrelas', 'reviews', 'preferido', 'superhost'],
        en: ['reviews', 'review', 'rating', 'ratings', 'stars', 'superhost', 'guest favorite'],
        es: ['resenas', 'opiniones', 'calificacion', 'calificaciones', 'puntuacion', 'estrellas', 'comentarios']
      },
      a: {
        pt: 'Loft Residence: nota 5,0 no Airbnb nos studios 607 e 807, com o selo Preferido dos hóspedes; na Booking, 9,6 (607) e 9,0 (807). New Time (studio 1303): 9,2 na Booking, com 32 avaliações, e 4,73 no Airbnb. Notas consultadas em outubro de 2026; as avaliações completas estão em cada anúncio.',
        en: 'Loft Residence: rated 5.0 on Airbnb for studios 607 and 807, with the Guest Favorite badge; on Booking, 9.6 (607) and 9.0 (807). New Time (studio 1303): 9.2 on Booking from 32 reviews, and 4.73 on Airbnb. Ratings checked in October 2026; full reviews are on each listing.',
        es: 'Loft Residence: nota 5,0 en Airbnb en los studios 607 y 807, con el sello Favorito de los huéspedes; en Booking, 9,6 (607) y 9,0 (807). New Time (studio 1303): 9,2 en Booking, con 32 reseñas, y 4,73 en Airbnb. Notas consultadas en octubre de 2026; las reseñas completas están en cada anuncio.'
      }
    },
    {
      id: 'proprietarios', rel: ['quem', 'contato'], waDono: true,
      chip: { pt: 'Sou proprietário', en: 'I own a property', es: 'Soy propietario' },
      k: {
        pt: ['proprietario', 'proprietaria', 'dono', 'dona', 'meu imovel', 'meu apartamento', 'administrar', 'administracao', 'gestao', 'tenho um imovel', 'tenho um apartamento', 'anunciar meu', 'gerenciar'],
        en: ['owner', 'my property', 'my apartment', 'property management', 'manage my', 'list my'],
        es: ['propietario', 'propietaria', 'dueno', 'duena', 'mi propiedad', 'mi departamento', 'administrar', 'administracion', 'gestion']
      },
      a: {
        pt: 'A Notte cuida de tudo para quem tem imóvel de temporada em Maceió e no litoral de Alagoas: anúncio no Airbnb e na Booking, preço ajustado a cada data, atendimento aos hóspedes, limpeza e enxoval, e prestação de contas todo mês. [Como funciona](/proprietarios/)',
        en: 'Notte takes care of everything for owners of holiday rentals in Maceió and on the Alagoas coast: Airbnb and Booking listings, prices adjusted for every date, guest service, cleaning and linen, and a monthly statement. [How it works](/proprietarios/)',
        es: 'Notte se ocupa de todo para quien tiene un inmueble de temporada en Maceió y en la costa de Alagoas: anuncios en Airbnb y Booking, precio ajustado a cada fecha, atención a los huéspedes, limpieza y ropa de cama, y rendición de cuentas todos los meses. [Cómo funciona](/proprietarios/)'
      }
    },
    {
      id: 'quem', rel: ['imoveis', 'avaliacoes', 'contato'],
      k: {
        pt: ['quem e voce', 'quem sao', 'quem e a notte', 'notte:1', 'empresa', 'creci', 'corretor', 'confiavel'],
        en: ['who are you', 'about you', 'company', 'notte:1', 'trust', 'legit'],
        es: ['quienes son', 'quien eres', 'empresa', 'notte:1', 'confiable']
      },
      a: {
        pt: 'A Notte Stays é uma gestora de imóveis por temporada em Maceió e no litoral de Alagoas. À frente dela está um corretor de imóveis com formação jurídica (CRECI 7883). Hoje estamos na Pajuçara, em Cruz das Almas e na Barra de São Miguel. Eu sou o assistente automático do site.',
        en: 'Notte Stays manages holiday rentals in Maceió and on the Alagoas coast. It is run by a licensed real estate broker with a legal background (CRECI 7883). We are currently in Pajuçara, Cruz das Almas and Barra de São Miguel. I am the website\'s automatic assistant.',
        es: 'Notte Stays es una administradora de alquileres de temporada en Maceió y en la costa de Alagoas. Al frente hay un corredor inmobiliario con formación jurídica (CRECI 7883). Hoy estamos en Pajuçara, Cruz das Almas y Barra de São Miguel. Yo soy el asistente automático del sitio.'
      }
    },
    {
      id: 'contato', rel: ['reservar', 'valores'], wa: true, ig: true,
      chip: { pt: 'Falar com a gente', en: 'Talk to us', es: 'Hablar con nosotros' },
      k: {
        pt: ['whatsapp', 'zap', 'telefone', 'contato', 'falar com', 'atendente', 'humano', 'ligar', 'instagram', 'insta'],
        en: ['whatsapp', 'phone', 'contact', 'talk to', 'human', 'agent', 'call', 'instagram'],
        es: ['whatsapp', 'telefono', 'contacto', 'hablar con', 'humano', 'llamar', 'instagram']
      },
      a: {
        pt: 'Fale direto com a gente pelo WhatsApp, (82) 99619-6123, e acompanhe as novidades no Instagram, @nottestays.',
        en: 'Message us directly on WhatsApp, +55 82 99619-6123, and follow us on Instagram, @nottestays.',
        es: 'Escríbenos directo por WhatsApp, +55 82 99619-6123, y síguenos en Instagram, @nottestays.'
      }
    },
    {
      id: 'minimo', rel: ['longa', 'checkin', 'valores'],
      k: {
        pt: ['minimo de noites:3', 'estadia minima:3', 'minimo de diarias:3', 'quantas noites', 'uma noite', '1 noite', 'so uma noite', 'uma diaria', 'so uma diaria', 'noite so'],
        en: ['minimum stay:3', 'minimum nights:3', 'one night', '1 night', 'how many nights', 'single night'],
        es: ['estadia minima:3', 'minimo de noches:3', 'una noche', '1 noche', 'cuantas noches', 'solo una noche']
      },
      a: {
        pt: 'A estadia mínima é de **2 noites**.',
        en: 'The minimum stay is **2 nights**.',
        es: 'La estadía mínima es de **2 noches**.'
      }
    },
    {
      id: 'longa', rel: ['valores', 'reservar', 'pagamento'], wa: true,
      k: {
        pt: ['desconto', 'descontos', 'semana', 'semanal', 'mes', 'mensal', 'mensalidade', 'estadia longa', 'longa temporada', 'temporada longa', 'um mes', '30 dias', 'morar', 'trabalho remoto'],
        en: ['discount', 'discounts', 'week', 'weekly', 'month', 'monthly', 'long stay', 'long term', 'extended stay'],
        es: ['descuento', 'descuentos', 'semana', 'semanal', 'mes', 'mensual', 'estadia larga', 'larga estadia', 'largo plazo', 'un mes']
      },
      a: {
        pt: 'Sim. No Airbnb, estadias de **7 noites ou mais** têm 10% de desconto, e de **28 noites ou mais**, 20%. Na Booking, há uma tarifa semanal com desconto, a partir de 7 noites, e uma tarifa não reembolsável mais barata. Pelas plataformas, a estadia vai até 30 noites; para um período maior, fale com a gente no WhatsApp.',
        en: 'Yes. On Airbnb, stays of **7 nights or more** get 10% off, and stays of **28 nights or more** get 20% off. On Booking there is a discounted weekly rate from 7 nights, and a cheaper non-refundable rate. Through the platforms, stays go up to 30 nights; for a longer period, message us on WhatsApp.',
        es: 'Sí. En Airbnb, las estadías de **7 noches o más** tienen 10% de descuento, y las de **28 noches o más**, 20%. En Booking hay una tarifa semanal con descuento, a partir de 7 noches, y una tarifa no reembolsable más barata. Por las plataformas, la estadía llega hasta 30 noches; para un período más largo, escríbenos por WhatsApp.'
      }
    },
    {
      id: 'caucao', rel: ['regras', 'pagamento'],
      k: {
        pt: ['caucao:3', 'deposito caucao:3', 'garantia', 'dano', 'danos', 'quebrar', 'quebrou', 'estragar'],
        en: ['security deposit:3', 'damage deposit:3', 'deposit:3', 'damage', 'damages', 'break', 'broke'],
        es: ['deposito de garantia:3', 'garantia', 'dano', 'danos', 'romper', 'rompi']
      },
      a: {
        pt: 'Não cobramos caução nem depósito. Mas qualquer dano ao apartamento ou aos objetos, em todos os imóveis, deve ser ressarcido pelo hóspede.',
        en: 'We do not charge a security deposit. However, in all our homes, any damage to the apartment or its contents must be paid for by the guest.',
        es: 'No cobramos depósito de garantía. Pero cualquier daño al departamento o a los objetos, en todos los alojamientos, debe ser resarcido por el huésped.'
      }
    },
    {
      id: 'menores', rel: ['criancas', 'hospedes', 'regras'],
      k: {
        pt: ['menor de idade:3', 'menores de idade:3', 'menor:1', 'menores:1', 'adolescente', 'adolescentes', 'idade minima', 'sem os pais', 'sem adulto', 'desacompanhado'],
        en: ['minor:3', 'minors:3', 'under 18:3', 'teenager', 'teenagers', 'minimum age', 'without parents', 'unaccompanied'],
        es: ['menor de edad:3', 'menores de edad:3', 'adolescente', 'adolescentes', 'edad minima', 'sin los padres', 'sin adulto']
      },
      a: {
        pt: 'Menores de idade só podem se hospedar acompanhados de um adulto.',
        en: 'Minors can only stay when accompanied by an adult.',
        es: 'Los menores de edad solo pueden hospedarse acompañados de un adulto.'
      }
    },
    {
      id: 'terceiros', rel: ['reservar', 'chegada'],
      k: {
        pt: ['para outra pessoa:5', 'em nome de outra:5', 'para um parente:5', 'para minha mae:5', 'para meu pai:5', 'para meus pais:5', 'para meu filho:5', 'para minha filha:5', 'para um amigo:5', 'para uma amiga:5', 'para um funcionario:5', 'para terceiros:5', 'nao vou me hospedar:5', 'outra pessoa:3'],
        en: ['for someone else:5', 'for another person:5', 'for my parents:5', 'for my mother:5', 'for my father:5', 'for a friend:5', 'for an employee:5', 'on behalf of:5'],
        es: ['para otra persona:5', 'a nombre de otra:5', 'para un familiar:5', 'para mis padres:5', 'para mi madre:5', 'para mi padre:5', 'para un amigo:5', 'para un empleado:5']
      },
      a: {
        pt: 'Pode, sim. Você faz a reserva normalmente pela plataforma e, pela conversa da reserva, informa o nome completo e o documento de quem vai se hospedar, para o cadastro na portaria ou na recepção. Quem fez a reserva continua sendo o responsável por ela, inclusive pelas regras da casa.',
        en: 'Yes. Book as usual on the platform and, in the booking chat, send the full name and ID of the person who will stay, for registration at the gatehouse or reception. The person who booked remains responsible for the reservation, including the house rules.',
        es: 'Sí. Haces la reserva normalmente por la plataforma y, por el chat de la reserva, informas el nombre completo y el documento de quien se va a hospedar, para el registro en la portería o la recepción. Quien hizo la reserva sigue siendo responsable por ella, incluidas las reglas de la casa.'
      }
    },
    {
      id: 'nota', rel: ['pagamento', 'reservar'],
      k: {
        pt: ['nota fiscal:3', 'nota:1', 'recibo', 'comprovante', 'cnpj', 'empresa paga', 'reembolso da empresa'],
        en: ['invoice:3', 'receipt', 'tax invoice', 'company invoice'],
        es: ['factura:3', 'recibo', 'comprobante']
      },
      a: {
        pt: 'Não emitimos nota fiscal. O comprovante da reserva e do pagamento fica disponível na própria plataforma em que você reservou, o Airbnb ou a Booking.',
        en: 'We do not issue tax invoices. The booking and payment receipt is available on the platform where you booked, Airbnb or Booking.',
        es: 'No emitimos factura. El comprobante de la reserva y del pago está disponible en la propia plataforma donde reservaste, Airbnb o Booking.'
      }
    },
    {
      id: 'eletro', rel: ['itens', 'cozinha', 'wifi'],
      k: {
        pt: ['ferro', 'passar roupa', 'secador', 'maquina de lavar', 'lavar roupa', 'lavadora', 'tanque', 'lavanderia:1'],
        en: ['iron', 'ironing', 'hair dryer', 'hairdryer', 'washing machine', 'washer', 'do laundry'],
        es: ['plancha', 'planchar', 'secador', 'secador de pelo', 'lavarropas', 'lavadora', 'lavar ropa']
      },
      a: {
        pt: {
          nt: 'Tem ferro de passar e secador de cabelo. Máquina de lavar não tem no apartamento, mas o prédio tem lavanderia, paga à parte.',
          loft: 'Tem ferro de passar e secador de cabelo. Máquina de lavar não tem no apartamento, mas o prédio tem lavanderia, paga à parte.',
          iloa: 'Tem ferro de passar e secador de cabelo, e o apartamento tem tanque para lavar roupa.'
        },
        en: {
          nt: 'There is an iron and a hair dryer. There is no washing machine in the apartment, but the building has a paid laundry room.',
          loft: 'There is an iron and a hair dryer. There is no washing machine in the apartment, but the building has a paid laundry room.',
          iloa: 'There is an iron and a hair dryer, and the apartment has a laundry sink for hand washing.'
        },
        es: {
          nt: 'Hay plancha y secador de pelo. No hay lavarropas en el departamento, pero el edificio tiene lavandería paga.',
          loft: 'Hay plancha y secador de pelo. No hay lavarropas en el departamento, pero el edificio tiene lavandería paga.',
          iloa: 'Hay plancha y secador de pelo, y el departamento tiene pileta para lavar ropa a mano.'
        }
      }
    },
    {
      id: 'itens', rel: ['enxoval', 'cozinha', 'eletro'],
      k: {
        pt: ['sabonete', 'xampu', 'shampoo', 'papel higienico', 'higiene', 'cafe', 'acucar', 'sal', 'oleo', 'tempero', 'temperos', 'mantimentos'],
        en: ['soap', 'shampoo', 'toilet paper', 'toiletries', 'coffee', 'sugar', 'salt', 'oil', 'groceries', 'condiments'],
        es: ['jabon', 'champu', 'shampoo', 'papel higienico', 'higiene', 'cafe', 'azucar', 'sal', 'aceite', 'condimentos']
      },
      a: {
        pt: 'Deixamos sabonete, xampu e papel higiênico. Café, açúcar, sal e óleo não são fornecidos.',
        en: 'We provide soap, shampoo and toilet paper. Coffee, sugar, salt and oil are not provided.',
        es: 'Dejamos jabón, champú y papel higiénico. No se incluyen café, azúcar, sal ni aceite.'
      }
    },
    {
      id: 'chuveiro', rel: ['itens', 'wifi'],
      k: {
        pt: ['chuveiro', 'agua quente', 'banho quente', 'aquecedor'],
        en: ['shower', 'hot water', 'hot shower'],
        es: ['ducha', 'agua caliente', 'calefon']
      },
      a: {
        pt: 'Sim, todos os imóveis têm chuveiro quente.',
        en: 'Yes, all our homes have a hot shower.',
        es: 'Sí, todos los alojamientos tienen ducha con agua caliente.'
      }
    },
    {
      id: 'praiaitens', rel: ['localizacao', 'itens'],
      k: {
        pt: ['cadeira de praia:3', 'guarda sol:3', 'guarda-sol:3', 'toalha de praia:3', 'cooler:3', 'isopor', 'kit praia', 'barraca de praia'],
        en: ['beach chair:3', 'beach chairs:3', 'umbrella:3', 'parasol', 'beach towel:3', 'beach towels:3', 'cooler:3'],
        es: ['silla de playa:3', 'sombrilla:3', 'toalla de playa:3', 'conservadora', 'heladerita']
      },
      a: {
        pt: 'Não fornecemos cadeira de praia, guarda-sol, toalha de praia nem cooler.',
        en: 'We do not provide beach chairs, umbrellas, beach towels or coolers.',
        es: 'No ofrecemos sillas de playa, sombrilla, toallas de playa ni conservadora.'
      }
    },
    {
      id: 'varanda', rel: ['localizacao', 'fumar'],
      k: {
        pt: ['varanda', 'sacada', 'vista para o mar:3', 'vista pro mar:3', 'vista do mar:3', 'vista mar:3', 'janela'],
        en: ['balcony', 'terrace', 'sea view:3', 'ocean view:3', 'window'],
        es: ['balcon', 'terraza', 'vista al mar:3', 'ventana']
      },
      a: {
        pt: {
          nt: 'Sim, o studio tem sacada, e fica de frente para o mar, com vista lateral para o mar.',
          loft: 'O studio fica de frente para o mar e tem janelas do piso ao teto com vista para o mar. Não tem varanda.',
          iloa: 'Sim, o apartamento tem varanda, com vista para o jardim do condomínio.'
        },
        en: {
          nt: 'Yes, the studio has a balcony, and it faces the sea with a side sea view.',
          loft: 'The studio faces the sea and has floor-to-ceiling windows with a sea view. It has no balcony.',
          iloa: 'Yes, the apartment has a balcony overlooking the condo garden.'
        },
        es: {
          nt: 'Sí, el studio tiene balcón y está frente al mar, con vista lateral al mar.',
          loft: 'El studio está frente al mar y tiene ventanales de piso a techo con vista al mar. No tiene balcón.',
          iloa: 'Sí, el departamento tiene balcón con vista al jardín del condominio.'
        }
      }
    },
    {
      id: 'elevador', rel: ['estacionamento', 'chegada'],
      k: {
        pt: ['elevador', 'escada', 'escadas'],
        en: ['elevator', 'lift', 'stairs'],
        es: ['ascensor', 'elevador', 'escalera', 'escaleras']
      },
      a: {
        pt: 'Sim, todos os prédios têm elevador, inclusive o ILOA.',
        en: 'Yes, all the buildings have an elevator, including ILOA.',
        es: 'Sí, todos los edificios tienen ascensor, incluido ILOA.'
      }
    },
    {
      id: 'arredores', rel: ['restaurantes', 'localizacao'],
      k: {
        pt: ['farmacia', 'padaria', 'supermercado', 'mercado perto:3', 'perto:1', 'a pe', 'andando', 'caminhando', 'comercio'],
        en: ['pharmacy', 'drugstore', 'bakery', 'supermarket', 'walking distance', 'on foot', 'shops', 'nearby:1'],
        es: ['farmacia', 'panaderia', 'supermercado', 'a pie', 'caminando', 'comercios', 'cerca:1']
      },
      a: {
        pt: {
          nt: 'Sim, dá para ir a pé a mercado, farmácia e padaria.',
          loft: 'Sim, dá para ir a pé a mercado, farmácia e padaria.',
          iloa: 'No ILOA, mercado, farmácia e padaria não ficam a uma distância de caminhada. O condomínio tem conveniência 24 horas e restaurante.'
        },
        en: {
          nt: 'Yes, there is a market, a pharmacy and a bakery within walking distance.',
          loft: 'Yes, there is a market, a pharmacy and a bakery within walking distance.',
          iloa: 'At ILOA, markets, pharmacies and bakeries are not within walking distance. The condo has a 24-hour convenience store and a restaurant.'
        },
        es: {
          nt: 'Sí, hay mercado, farmacia y panadería a una distancia que se hace caminando.',
          loft: 'Sí, hay mercado, farmacia y panadería a una distancia que se hace caminando.',
          iloa: 'En ILOA, mercado, farmacia y panadería no quedan a distancia caminable. El condominio tiene minimercado 24 horas y restaurante.'
        }
      }
    },
    {
      // assuntos que o chat NÃO responde (ainda sem resposta aprovada): vão direto para o WhatsApp.
      // Quando houver resposta aprovada, tirar a palavra daqui e criar o assunto acima.
      id: 'semresposta', k: {
        pt: ['parcela:5', 'parcelar:5', 'parcelado:5'],
        en: ['installments:5'],
        es: ['cuotas:5']
      }
    },
    {
      id: 'ola', k: {
        pt: ['oi:1', 'ola:1', 'bom dia:1', 'boa tarde:1', 'boa noite:1', 'opa:1', 'tudo bem:1'],
        en: ['hi:1', 'hello:1', 'hey:1', 'good morning:1', 'good afternoon:1', 'good evening:1'],
        es: ['hola:1', 'buenos dias:1', 'buenas tardes:1', 'buenas noches:1', 'que tal:1']
      }
    },
    {
      id: 'obrigado', k: {
        pt: ['obrigado:1', 'obrigada:1', 'valeu:1', 'agradeco:1'],
        en: ['thanks:1', 'thank you:1', 'thx:1'],
        es: ['gracias:1', 'muchas gracias:1']
      }
    }
  ];

  // ---------- busca ----------
  function norm(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, ' ').trim();
  }

  var PROP = [
    ['nt', /\b(new ?time|1302|1303|1304|pajucara)\b/],
    ['loft', /\b(loft|607|807|cruz das almas)\b/],
    ['iloa', /\b(iloa|barra|sao miguel|gunga|frances)\b/]
  ];

  // palavras-chave dos três idiomas juntas; a mesma palavra em dois idiomas conta uma vez só
  BASE.forEach(function (e) {
    var seen = {};
    LANGS.forEach(function (l) {
      (e.k[l] || []).forEach(function (raw) {
        var p = raw.split(':'), t = norm(p[0]), w = p[1] ? +p[1] : 2;
        if (!seen[t] || seen[t] < w) seen[t] = w;
      });
    });
    e.kw = Object.keys(seen).map(function (t) { return { t: t, w: seen[t] }; });
  });
  var byId = {};
  BASE.forEach(function (e) { byId[e.id] = e; });

  function score(e, txt, toks) {
    var s = 0;
    e.kw.forEach(function (k) {
      var hit;
      if (k.t.indexOf(' ') > -1) hit = (' ' + txt + ' ').indexOf(' ' + k.t + ' ') > -1;
      else if (k.t.length <= 3) hit = toks.indexOf(k.t) > -1;
      else hit = toks.some(function (t) { return t.indexOf(k.t) === 0; });
      if (hit) s += k.w;
    });
    return s;
  }

  function findProps(txt) {
    var out = [];
    PROP.forEach(function (p) { if (p[1].test(txt)) out.push(p[0]); });
    return out;
  }

  function pageProp() {
    var p = location.pathname;
    if (p.indexOf('new-time') > -1) return 'nt';
    if (p.indexOf('loft') > -1) return 'loft';
    if (p.indexOf('iloa') > -1) return 'iloa';
    return null;
  }

  function answer(q) {
    var txt = norm(q), toks = txt ? txt.split(' ') : [];
    var props = findProps(txt);
    var best = null, bestS = 0;
    BASE.forEach(function (e) {
      var s = score(e, txt, toks);
      if (s > bestS) { best = e; bestS = s; }
    });
    // só citou o imóvel ("e o Loft?") -> apresentação dele
    if (props.length && (!best || bestS < 2 || best.id === 'ola') && toks.length <= 4) return { e: byId.sobre, props: props };
    if (best && best.id === 'semresposta') return null;
    if (!best || bestS < 2) {
      if (best && (best.id === 'ola' || best.id === 'obrigado') && toks.length <= 4) return { e: best, props: props };
      return null;
    }
    return { e: best, props: props };
  }

  // ---------- tela ----------
  var lang = 'pt', root, log, input, launch, panel, langBtns = {}, lastFocus;

  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function fmt(s) {
    return esc(s)
      .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
      .replace(/\n/g, '<br>');
  }

  function waLink(text) { return 'https://wa.me/' + WA_NUM + '?text=' + encodeURIComponent(text); }

  var ICO = {
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/><path d="M8.5 11h.01M12 11h.01M15.5 11h.01"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12l16-8-6 16-2.5-6.5z"/></svg>',
    ig: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>',
    wa: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.4-.3z"/></svg>',
    mark: '<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" stroke-width="2.8"/><text x="50" y="66" text-anchor="middle" font-family="Cormorant Garamond, serif" font-weight="500" font-size="50" fill="currentColor">N</text><circle cx="78.3" cy="21.7" r="7" fill="#D1B06A"/></svg>'
  };

  function el(tag, cls, html) { var n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; }

  function scrollDown() { log.scrollTop = log.scrollHeight; }

  function botSay(html) { log.appendChild(el('div', 'nc-msg nc-bot', html)); scrollDown(); }
  function userSay(text) { var m = el('div', 'nc-msg nc-user'); m.textContent = text; log.appendChild(m); scrollDown(); }

  function chips(list) {
    var box = el('div', 'nc-chips');
    list.forEach(function (c) { box.appendChild(c); });
    log.appendChild(box); scrollDown();
  }
  function topicChip(id) {
    var e = byId[id], b = el('button', 'nc-chip');
    b.type = 'button'; b.textContent = (e.chip && e.chip[lang]) || id;
    b.addEventListener('click', function () { userSay(b.textContent); reply({ e: e, props: [] }); });
    return b;
  }
  function linkChip(cls, href, ico, label) {
    var a = el('a', 'nc-chip ' + cls, ico + '<span></span>');
    a.href = href; a.target = '_blank'; a.rel = 'noopener'; a.lastChild.textContent = label;
    return a;
  }
  function waChip(text, label) { return linkChip('wa', waLink(text), ICO.wa, label || UI[lang].wa); }
  function igChip() { return linkChip('ig', IG_URL, ICO.ig, UI[lang].igChip); }
  function menuChip() {
    var b = el('button', 'nc-chip'); b.type = 'button'; b.textContent = UI[lang].menu;
    b.addEventListener('click', function () { showMenu(); });
    return b;
  }

  function showMenu() {
    chips(MENU.map(function (id) { return id === 'contato' ? waChip(UI[lang].waHello) : topicChip(id); }).concat([igChip()]));
  }

  function textFor(e, props) {
    var a = e.a[lang];
    if (typeof a === 'string') return a;
    var want = props.length ? props : (pageProp() ? [pageProp()] : ['nt', 'loft', 'iloa']);
    if (want.length === 1) return a[want[0]];
    return want.map(function (p) {
      var t = a[p], name = UI[lang].props[p];
      return t.indexOf('**' + name) > -1 ? t : '**' + name + ':** ' + t;
    }).join('\n\n');
  }

  function reply(r, q) {
    if (!r) {
      botSay(fmt(UI[lang].miss));
      chips([waChip(UI[lang].waQ + q, UI[lang].waAsk), menuChip()]);
      return;
    }
    var e = r.e;
    if (e.id === 'ola') { botSay(fmt(UI[lang].hello)); showMenu(); return; }
    if (e.id === 'obrigado') { botSay(fmt(UI[lang].thanks)); chips([menuChip(), waChip(UI[lang].waHello)]); return; }
    botSay(fmt(textFor(e, r.props) + (e.extra ? e.extra[lang] : '')));
    var list = [];
    if (e.waDono) list.push(waChip(UI[lang].waDono));
    else if (e.wa) list.push(waChip(q ? UI[lang].waQ + q : UI[lang].waHello));
    if (e.ig) list.push(igChip());
    (e.rel || []).slice(0, 3).forEach(function (id) { if (byId[id].chip || byId[id].a) list.push(topicChip(id)); });
    list.push(menuChip());
    chips(list);
  }

  // rótulo de assunto sem chip próprio (usado nos botões de "relacionados")
  var LABEL = {
    sobre: { pt: 'O imóvel', en: 'The home', es: 'El alojamiento' },
    hospedes: { pt: 'Quantas pessoas', en: 'How many guests', es: 'Cuántas personas' },
    chegada: { pt: 'Como é a chegada', en: 'Arrival', es: 'Cómo es la llegada' },
    cozinha: { pt: 'Cozinha', en: 'Kitchen', es: 'Cocina' },
    wifi: { pt: 'Wi-Fi e ar', en: 'Wi-Fi & A/C', es: 'Wifi y aire' },
    enxoval: { pt: 'Roupa de cama e limpeza', en: 'Linen & cleaning', es: 'Ropa de cama y limpieza' },
    cancelamento: { pt: 'Cancelamento', en: 'Cancellation', es: 'Cancelación' },
    fumar: { pt: 'Pode fumar?', en: 'Smoking', es: '¿Se puede fumar?' },
    regras: { pt: 'Regras da casa', en: 'House rules', es: 'Reglas de la casa' },
    localizacao: { pt: 'Localização e praia', en: 'Location & beach', es: 'Ubicación y playa' },
    restaurantes: { pt: 'Onde comer', en: 'Where to eat', es: 'Dónde comer' },
    bagagem: { pt: 'Malas', en: 'Luggage', es: 'Equipaje' },
    criancas: { pt: 'Crianças', en: 'Kids', es: 'Niños' },
    seguranca: { pt: 'Segurança', en: 'Safety', es: 'Seguridad' },
    avaliacoes: { pt: 'Avaliações', en: 'Reviews', es: 'Reseñas' },
    quem: { pt: 'Quem somos', en: 'About us', es: 'Quiénes somos' },
    pets: { pt: 'Animais', en: 'Pets', es: 'Mascotas' },
    festas: { pt: 'Festas', en: 'Parties', es: 'Fiestas' },
    visitas: { pt: 'Visitas', en: 'Visitors', es: 'Visitas' },
    pagamento: { pt: 'Pagamento', en: 'Payment', es: 'Pago' },
    transfer: { pt: 'Aeroporto e transfer', en: 'Airport & transfer', es: 'Aeropuerto y traslado' },
    minimo: { pt: 'Mínimo de noites', en: 'Minimum stay', es: 'Estadía mínima' },
    longa: { pt: 'Descontos e estadia longa', en: 'Discounts & long stays', es: 'Descuentos y estadías largas' },
    caucao: { pt: 'Caução e danos', en: 'Deposit & damage', es: 'Depósito y daños' },
    menores: { pt: 'Menores de idade', en: 'Minors', es: 'Menores de edad' },
    terceiros: { pt: 'Reservar para outra pessoa', en: 'Booking for someone else', es: 'Reservar para otra persona' },
    nota: { pt: 'Nota fiscal', en: 'Invoice', es: 'Factura' },
    eletro: { pt: 'Ferro, secador e lavar roupa', en: 'Iron, hair dryer & laundry', es: 'Plancha, secador y lavado' },
    itens: { pt: 'Itens de higiene', en: 'Toiletries', es: 'Artículos de higiene' },
    chuveiro: { pt: 'Chuveiro quente', en: 'Hot shower', es: 'Agua caliente' },
    praiaitens: { pt: 'Itens de praia', en: 'Beach gear', es: 'Artículos de playa' },
    varanda: { pt: 'Varanda e vista', en: 'Balcony & view', es: 'Balcón y vista' },
    elevador: { pt: 'Elevador', en: 'Elevator', es: 'Ascensor' },
    arredores: { pt: 'Mercado e farmácia', en: 'Shops nearby', es: 'Mercado y farmacia' }
  };
  Object.keys(LABEL).forEach(function (id) { if (byId[id] && !byId[id].chip) byId[id].chip = LABEL[id]; });

  function setLang(l, announce) {
    lang = l; store('notte-chat-lang', l);
    LANGS.forEach(function (x) { langBtns[x].setAttribute('aria-pressed', x === l ? 'true' : 'false'); });
    var u = UI[l];
    panel.setAttribute('aria-label', 'Notte Stays · ' + u.sub);
    panel.querySelector('.nc-title small').textContent = u.sub;
    panel.querySelector('.nc-close').setAttribute('aria-label', u.close);
    panel.querySelector('.nc-ig').setAttribute('aria-label', u.ig);
    input.placeholder = u.ph;
    panel.querySelector('.nc-send').setAttribute('aria-label', u.send);
    panel.querySelector('.nc-note').textContent = u.note;
    launch.querySelector('.nc-label').textContent = u.launch;
    launch.setAttribute('aria-label', u.open);
    if (announce) { botSay(fmt(u.hello)); showMenu(); }
  }

  var started = false;
  function open() {
    lastFocus = document.activeElement;
    panel.classList.add('open'); panel.removeAttribute('inert');
    launch.setAttribute('aria-expanded', 'true');
    if (!started) { started = true; botSay(fmt(UI[lang].hello)); showMenu(); }
    setTimeout(function () { if (window.matchMedia('(min-width:600px)').matches) input.focus(); else panel.querySelector('.nc-close').focus(); }, 60);
  }
  function close() {
    panel.classList.remove('open'); panel.setAttribute('inert', '');
    launch.setAttribute('aria-expanded', 'false');
    if (lastFocus && lastFocus.focus) lastFocus.focus(); else launch.focus();
  }

  function build() {
    var saved = store('notte-chat-lang');
    if (LANGS.indexOf(saved) > -1) lang = saved;
    else {
      var nl = (navigator.language || 'pt').slice(0, 2).toLowerCase();
      lang = nl === 'es' ? 'es' : (nl === 'pt' ? 'pt' : (nl === 'en' ? 'en' : 'pt'));
    }

    launch = el('button', 'nc-launch', ICO.chat + '<span class="nc-label"></span><span class="nc-dot" aria-hidden="true"></span>');
    launch.type = 'button'; launch.setAttribute('aria-expanded', 'false'); launch.setAttribute('aria-controls', 'nc-panel');

    panel = el('section', 'nc-panel');
    panel.id = 'nc-panel'; panel.setAttribute('role', 'dialog'); panel.setAttribute('inert', '');
    panel.innerHTML =
      '<div class="nc-head"><div class="nc-top">' +
        '<span class="nc-mark">' + ICO.mark + '</span>' +
        '<div class="nc-title"><b>Notte Stays</b><small></small></div>' +
        '<a class="nc-ico nc-ig" href="' + IG_URL + '" target="_blank" rel="noopener">' + ICO.ig + '</a>' +
        '<button class="nc-ico nc-close" type="button">' + ICO.close + '</button>' +
      '</div><div class="nc-langs" role="group" aria-label="Idioma · Language · Idioma"></div></div>' +
      '<div class="nc-log" role="log" aria-live="polite"></div>' +
      '<form class="nc-form" autocomplete="off"><input type="text" maxlength="300" enterkeyhint="send" aria-label="Pergunta"><button class="nc-send" type="submit">' + ICO.send + '</button></form>' +
      '<div class="nc-note"></div>';

    var langBox = panel.querySelector('.nc-langs');
    [['pt', 'Português'], ['en', 'English'], ['es', 'Español']].forEach(function (p) {
      var b = el('button'); b.type = 'button'; b.textContent = p[1]; b.lang = p[0];
      b.addEventListener('click', function () { if (p[0] !== lang) setLang(p[0], started); });
      langBtns[p[0]] = b; langBox.appendChild(b);
    });

    log = panel.querySelector('.nc-log');
    input = panel.querySelector('input');

    launch.addEventListener('click', open);
    panel.querySelector('.nc-close').addEventListener('click', close);
    panel.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') close(); });
    panel.querySelector('form').addEventListener('submit', function (ev) {
      ev.preventDefault();
      var q = input.value.trim();
      if (!q) return;
      input.value = '';
      userSay(q);
      reply(answer(q), q);
    });

    document.body.appendChild(launch);
    document.body.appendChild(panel);
    document.body.classList.add('has-chat');
    setLang(lang, false);
  }

  // usado só na conferência (teste das respostas); não muda nada na tela
  window.NotteChat = { answer: function (q) { var r = answer(q); return r ? r.e.id + (r.props.length ? ' [' + r.props.join(',') + ']' : '') : null; } };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
