// Sistema de Internacionalização (i18n) - Gestor PRO
const translations = {
    'pt': {
        // Navegação
        'dashboard': 'Dashboard',
        'clients': 'Clientes',
        'sales': 'Vendas',
        'products': 'Produtos',
        'purchases': 'Compras',
        'suppliers': 'Fornecedores',
        'users': 'Utilizadores',
        'reports': 'Relatórios',
        'settings': 'Configurações',
        'logout': 'Sair',
        'appTitle': 'Gestor PRO',

        // Dashboard
        'totalClients': 'TOTAL DE CLIENTES',
        'salesThisMonth': 'VENDAS ESTE MÊS',
        'totalReceivable': 'TOTAL A RECEBER',
        'totalAccountsPayable': 'CONTAS A PAGAR',
        'profit': 'LUCRO',
        'overdueSales': 'VENDAS VENCIDAS',
        'orderValue': 'VALOR DO PEDIDO',
        'averageTicket': 'TICKET MÉDIO',
        'topProducts': 'PRODUTOS MAIS VENDIDOS',
        'topClients': 'CLIENTES COM MAIS COMPRAS',
        'topSuppliers': 'TOP FORNECEDORES',
        'financialMaturities': 'MATURIDADES FINANCEIRAS',
        'overdueReceivables': 'CONTAS A RECEBER VENCIDAS',
        'overduePayables': 'CONTAS A PAGAR VENCIDAS',

        // Formulários
        'name': 'Nome',
        'email': 'Email',
        'phone': 'Telefone',
        'address': 'Endereço',
        'document': 'Documento',
        'price': 'Preço',
        'cost': 'Custo',
        'stock': 'Estoque',
        'description': 'Descrição',
        'status': 'Status',
        'date': 'Data',
        'quantity': 'Quantidade',
        'total': 'Total',
        'username': 'Nome de utilizador',
        'password': 'Palavra-passe',
        'role': 'Função',
        'active': 'Ativo',
        'inactive': 'Inativo',

        // Ações
        'create': 'Criar',
        'edit': 'Editar',
        'delete': 'Eliminar',
        'save': 'Guardar',
        'cancel': 'Cancelar',
        'close': 'Fechar',
        'search': 'Pesquisar',
        'filter': 'Filtrar',
        'export': 'Exportar',
        'import': 'Importar',
        'refresh': 'Atualizar',
        'view': 'Ver',
        'details': 'Detalhes',

        // Status
        'pending': 'Pendente',
        'completed': 'Concluída',
        'cancelled': 'Cancelada',
        'active': 'Ativo',
        'inactive': 'Inativo',

        // Mensagens
        'success': 'Sucesso',
        'error': 'Erro',
        'warning': 'Aviso',
        'info': 'Informação',
        'loading': 'A carregar...',
        'noData': 'Nenhum dado encontrado',
        'confirmDelete': 'Tem a certeza que deseja eliminar?',
        'operationSuccess': 'Operação realizada com sucesso',
        'operationError': 'Erro ao realizar operação',
        'dataSaved': 'Dados guardados com sucesso',
        'dataDeleted': 'Dados eliminados com sucesso',

        // Relatórios
        'salesReport': 'Relatório de Vendas',
        'cashFlowReport': 'Relatório de Fluxo de Caixa',
        'accountingReport': 'Relatório Contábil',
        'salesPrediction': 'Análise Preditiva de Vendas',
        'startDate': 'Data de Início',
        'endDate': 'Data de Fim',
        'generateReport': 'Gerar Relatório',
        'exportCSV': 'Exportar CSV',
        'exportPDF': 'Exportar PDF',
        'exportExcel': 'Exportar Excel',

        // Login
        'login': 'Entrar',
        'loginTitle': 'Gestor PRO - Login',
        'usernamePlaceholder': 'Nome de utilizador',
        'passwordPlaceholder': 'Palavra-passe',
        'loginButton': 'Entrar',
        'loginError': 'Credenciais inválidas',
        'welcome': 'Bem-vindo ao Gestor PRO',

        // Configurações
        'language': 'Idioma',
        'theme': 'Tema',
        'darkMode': 'Modo Escuro',
        'lightMode': 'Modo Claro',
        'autoMode': 'Automático',
        'notifications': 'Notificações',
        'profile': 'Perfil',
        'account': 'Conta',

        // Validações
        'required': 'Campo obrigatório',
        'invalidEmail': 'Email inválido',
        'invalidPhone': 'Telefone inválido',
        'invalidDocument': 'Documento inválido',
        'minLength': 'Mínimo de {min} caracteres',
        'maxLength': 'Máximo de {max} caracteres',
        'positiveNumber': 'Número deve ser positivo',
        'integerNumber': 'Número deve ser inteiro',

        // Meses
        'january': 'Janeiro',
        'february': 'Fevereiro',
        'march': 'Março',
        'april': 'Abril',
        'may': 'Maio',
        'june': 'Junho',
        'july': 'Julho',
        'august': 'Agosto',
        'september': 'Setembro',
        'october': 'Outubro',
        'november': 'Novembro',
        'december': 'Dezembro',

        // Dias da semana
        'monday': 'Segunda-feira',
        'tuesday': 'Terça-feira',
        'wednesday': 'Quarta-feira',
        'thursday': 'Quinta-feira',
        'friday': 'Sexta-feira',
        'saturday': 'Sábado',
        'sunday': 'Domingo',

        // Datas relativas
        'today': 'Hoje',
        'yesterday': 'Ontem',
        'daysAgo': 'Há {days} dias',
        'thisWeek': 'Esta semana',
        'lastWeek': 'Semana passada',
        'thisMonth': 'Este mês',
        'lastMonth': 'Mês passado',
        'thisYear': 'Este ano',
        'lastYear': 'Ano passado'
    },

    'en': {
        // Navigation
        'dashboard': 'Dashboard',
        'clients': 'Clients',
        'sales': 'Sales',
        'products': 'Products',
        'purchases': 'Purchases',
        'suppliers': 'Suppliers',
        'users': 'Users',
        'reports': 'Reports',
        'settings': 'Settings',
        'logout': 'Logout',
        'appTitle': 'Gestor PRO',

        // Dashboard
        'totalClients': 'TOTAL CLIENTS',
        'salesThisMonth': 'SALES THIS MONTH',
        'totalReceivable': 'TOTAL RECEIVABLE',
        'totalAccountsPayable': 'ACCOUNTS PAYABLE',
        'profit': 'PROFIT',
        'overdueSales': 'OVERDUE SALES',
        'orderValue': 'ORDER VALUE',
        'averageTicket': 'AVERAGE TICKET',
        'topProducts': 'TOP SELLING PRODUCTS',
        'topClients': 'TOP CLIENTS',
        'topSuppliers': 'TOP SUPPLIERS',
        'financialMaturities': 'FINANCIAL MATURITIES',
        'overdueReceivables': 'OVERDUE RECEIVABLES',
        'overduePayables': 'OVERDUE PAYABLES',

        // Forms
        'name': 'Name',
        'email': 'Email',
        'phone': 'Phone',
        'address': 'Address',
        'document': 'Document',
        'price': 'Price',
        'cost': 'Cost',
        'stock': 'Stock',
        'description': 'Description',
        'status': 'Status',
        'date': 'Date',
        'quantity': 'Quantity',
        'total': 'Total',
        'username': 'Username',
        'password': 'Password',
        'role': 'Role',
        'active': 'Active',
        'inactive': 'Inactive',

        // Actions
        'create': 'Create',
        'edit': 'Edit',
        'delete': 'Delete',
        'save': 'Save',
        'cancel': 'Cancel',
        'close': 'Close',
        'search': 'Search',
        'filter': 'Filter',
        'export': 'Export',
        'import': 'Import',
        'refresh': 'Refresh',
        'view': 'View',
        'details': 'Details',

        // Status
        'pending': 'Pending',
        'completed': 'Completed',
        'cancelled': 'Cancelled',
        'active': 'Active',
        'inactive': 'Inactive',

        // Messages
        'success': 'Success',
        'error': 'Error',
        'warning': 'Warning',
        'info': 'Information',
        'loading': 'Loading...',
        'noData': 'No data found',
        'confirmDelete': 'Are you sure you want to delete?',
        'operationSuccess': 'Operation completed successfully',
        'operationError': 'Error performing operation',
        'dataSaved': 'Data saved successfully',
        'dataDeleted': 'Data deleted successfully',

        // Reports
        'salesReport': 'Sales Report',
        'cashFlowReport': 'Cash Flow Report',
        'accountingReport': 'Accounting Report',
        'salesPrediction': 'Sales Prediction Analysis',
        'startDate': 'Start Date',
        'endDate': 'End Date',
        'generateReport': 'Generate Report',
        'exportCSV': 'Export CSV',
        'exportPDF': 'Export PDF',
        'exportExcel': 'Export Excel',

        // Login
        'login': 'Login',
        'loginTitle': 'Gestor PRO - Login',
        'usernamePlaceholder': 'Username',
        'passwordPlaceholder': 'Password',
        'loginButton': 'Login',
        'loginError': 'Invalid credentials',
        'welcome': 'Welcome to Gestor PRO',

        // Settings
        'language': 'Language',
        'theme': 'Theme',
        'darkMode': 'Dark Mode',
        'lightMode': 'Light Mode',
        'autoMode': 'Auto',
        'notifications': 'Notifications',
        'profile': 'Profile',
        'account': 'Account',

        // Validations
        'required': 'Required field',
        'invalidEmail': 'Invalid email',
        'invalidPhone': 'Invalid phone',
        'invalidDocument': 'Invalid document',
        'minLength': 'Minimum {min} characters',
        'maxLength': 'Maximum {max} characters',
        'positiveNumber': 'Number must be positive',
        'integerNumber': 'Number must be integer',

        // Months
        'january': 'January',
        'february': 'February',
        'march': 'March',
        'april': 'April',
        'may': 'May',
        'june': 'June',
        'july': 'July',
        'august': 'August',
        'september': 'September',
        'october': 'October',
        'november': 'November',
        'december': 'December',

        // Days of week
        'monday': 'Monday',
        'tuesday': 'Tuesday',
        'wednesday': 'Wednesday',
        'thursday': 'Thursday',
        'friday': 'Friday',
        'saturday': 'Saturday',
        'sunday': 'Sunday',

        // Relative dates
        'today': 'Today',
        'yesterday': 'Yesterday',
        'daysAgo': '{days} days ago',
        'thisWeek': 'This week',
        'lastWeek': 'Last week',
        'thisMonth': 'This month',
        'lastMonth': 'Last month',
        'thisYear': 'This year',
        'lastYear': 'Last year'
    },

    'es': {
        // Navegación
        'dashboard': 'Panel',
        'clients': 'Clientes',
        'sales': 'Ventas',
        'products': 'Productos',
        'purchases': 'Compras',
        'suppliers': 'Proveedores',
        'users': 'Usuarios',
        'reports': 'Reportes',
        'settings': 'Configuración',
        'logout': 'Cerrar Sesión',
        'appTitle': 'Gestor PRO',

        // Dashboard
        'totalClients': 'TOTAL DE CLIENTES',
        'salesThisMonth': 'VENTAS ESTE MES',
        'totalReceivable': 'TOTAL POR COBRAR',
        'totalAccountsPayable': 'CUENTAS POR PAGAR',
        'profit': 'GANANCIA',
        'overdueSales': 'VENTAS VENCIDAS',
        'orderValue': 'VALOR DEL PEDIDO',
        'averageTicket': 'TICKET PROMEDIO',
        'topProducts': 'PRODUCTOS MÁS VENDIDOS',
        'topClients': 'CLIENTES CON MÁS COMPRAS',
        'topSuppliers': 'TOP PROVEEDORES',
        'financialMaturities': 'VENCIMIENTOS FINANCIEROS',
        'overdueReceivables': 'CUENTAS POR COBRAR VENCIDAS',
        'overduePayables': 'CUENTAS POR PAGAR VENCIDAS',

        // Formularios
        'name': 'Nombre',
        'email': 'Email',
        'phone': 'Teléfono',
        'address': 'Dirección',
        'document': 'Documento',
        'price': 'Precio',
        'cost': 'Costo',
        'stock': 'Stock',
        'description': 'Descripción',
        'status': 'Estado',
        'date': 'Fecha',
        'quantity': 'Cantidad',
        'total': 'Total',
        'username': 'Nombre de usuario',
        'password': 'Contraseña',
        'role': 'Rol',
        'active': 'Activo',
        'inactive': 'Inactivo',

        // Acciones
        'create': 'Crear',
        'edit': 'Editar',
        'delete': 'Eliminar',
        'save': 'Guardar',
        'cancel': 'Cancelar',
        'close': 'Cerrar',
        'search': 'Buscar',
        'filter': 'Filtrar',
        'export': 'Exportar',
        'import': 'Importar',
        'refresh': 'Actualizar',
        'view': 'Ver',
        'details': 'Detalles',

        // Estados
        'pending': 'Pendiente',
        'completed': 'Completado',
        'cancelled': 'Cancelado',
        'active': 'Activo',
        'inactive': 'Inactivo',

        // Mensajes
        'success': 'Éxito',
        'error': 'Error',
        'warning': 'Advertencia',
        'info': 'Información',
        'loading': 'Cargando...',
        'noData': 'No se encontraron datos',
        'confirmDelete': '¿Está seguro de que desea eliminar?',
        'operationSuccess': 'Operación completada con éxito',
        'operationError': 'Error al realizar la operación',
        'dataSaved': 'Datos guardados con éxito',
        'dataDeleted': 'Datos eliminados con éxito',

        // Reportes
        'salesReport': 'Reporte de Ventas',
        'cashFlowReport': 'Reporte de Flujo de Caja',
        'accountingReport': 'Reporte Contable',
        'salesPrediction': 'Análisis Predictivo de Ventas',
        'startDate': 'Fecha de Inicio',
        'endDate': 'Fecha de Fin',
        'generateReport': 'Generar Reporte',
        'exportCSV': 'Exportar CSV',
        'exportPDF': 'Exportar PDF',
        'exportExcel': 'Exportar Excel',

        // Login
        'login': 'Iniciar Sesión',
        'loginTitle': 'Gestor PRO - Login',
        'usernamePlaceholder': 'Nombre de usuario',
        'passwordPlaceholder': 'Contraseña',
        'loginButton': 'Iniciar Sesión',
        'loginError': 'Credenciales inválidas',
        'welcome': 'Bienvenido a Gestor PRO',

        // Configuración
        'language': 'Idioma',
        'theme': 'Tema',
        'darkMode': 'Modo Oscuro',
        'lightMode': 'Modo Claro',
        'autoMode': 'Automático',
        'notifications': 'Notificaciones',
        'profile': 'Perfil',
        'account': 'Cuenta',

        // Validaciones
        'required': 'Campo requerido',
        'invalidEmail': 'Email inválido',
        'invalidPhone': 'Teléfono inválido',
        'invalidDocument': 'Documento inválido',
        'minLength': 'Mínimo {min} caracteres',
        'maxLength': 'Máximo {max} caracteres',
        'positiveNumber': 'El número debe ser positivo',
        'integerNumber': 'El número debe ser entero',

        // Meses
        'january': 'Enero',
        'february': 'Febrero',
        'march': 'Marzo',
        'april': 'Abril',
        'may': 'Mayo',
        'june': 'Junio',
        'july': 'Julio',
        'august': 'Agosto',
        'september': 'Septiembre',
        'october': 'Octubre',
        'november': 'Noviembre',
        'december': 'Diciembre',

        // Días de la semana
        'monday': 'Lunes',
        'tuesday': 'Martes',
        'wednesday': 'Miércoles',
        'thursday': 'Jueves',
        'friday': 'Viernes',
        'saturday': 'Sábado',
        'sunday': 'Domingo',

        // Fechas relativas
        'today': 'Hoy',
        'yesterday': 'Ayer',
        'daysAgo': 'Hace {days} días',
        'thisWeek': 'Esta semana',
        'lastWeek': 'La semana pasada',
        'thisMonth': 'Este mes',
        'lastMonth': 'El mes pasado',
        'thisYear': 'Este año',
        'lastYear': 'El año pasado'
    }
};

// Configurações de formatação local
const localeConfig = {
    'pt': {
        currency: 'EUR',
        currencySymbol: '€',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: 'HH:mm',
        numberFormat: {
            decimal: ',',
            thousands: '.',
            precision: 2
        }
    },
    'en': {
        currency: 'USD',
        currencySymbol: '$',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: 'HH:mm',
        numberFormat: {
            decimal: '.',
            thousands: ',',
            precision: 2
        }
    },
    'es': {
        currency: 'EUR',
        currencySymbol: '€',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: 'HH:mm',
        numberFormat: {
            decimal: ',',
            thousands: '.',
            precision: 2
        }
    }
};

// Exportar para uso global
window.translations = translations;
window.localeConfig = localeConfig; 