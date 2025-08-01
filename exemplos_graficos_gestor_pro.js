// Exemplos de Gráficos Elegantes para Gestor PRO
// =============================================

// 1. GRÁFICO DE VENDAS COM GRADIENTE E ANIMAÇÕES
// =============================================
function createElegantSalesChart(ctx, data) {
    // Criar gradientes
    const gradient1 = ctx.createLinearGradient(0, 0, 0, 400);
    gradient1.addColorStop(0, 'rgba(102, 126, 234, 0.8)');
    gradient1.addColorStop(1, 'rgba(102, 126, 234, 0.1)');

    const gradient2 = ctx.createLinearGradient(0, 0, 0, 400);
    gradient2.addColorStop(0, 'rgba(118, 75, 162, 0.8)');
    gradient2.addColorStop(1, 'rgba(118, 75, 162, 0.1)');

    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels || ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
            datasets: [{
                label: data.previousYearLabel || '2023',
                data: data.previousYear || [45, 52, 48, 61, 55, 67, 72, 68, 75, 82, 78, 89],
                backgroundColor: gradient1,
                borderColor: '#667eea',
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false,
            }, {
                label: data.currentYearLabel || '2024',
                data: data.currentYear || [52, 58, 55, 68, 62, 75, 82, 78, 85, 92, 88, 98],
                backgroundColor: gradient2,
                borderColor: '#764ba2',
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 2000,
                easing: 'easeInOutQuart'
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: { size: 12, weight: '600' }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#667eea',
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: true
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                        drawBorder: false
                    },
                    ticks: {
                        callback: (value) => `R$ ${value}K`,
                        font: { size: 11 }
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: { font: { size: 11, weight: '600' } }
                }
            }
        }
    });
}

// 2. GRÁFICO DE PIZZA 3D ELEGANTE
// ================================
function createElegantPieChart(ctx, data) {
    return new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.labels || ['Smartphones', 'Laptops', 'Tablets', 'Acessórios', 'Outros'],
            datasets: [{
                data: data.values || [35, 25, 20, 15, 5],
                backgroundColor: [
                    '#667eea',
                    '#764ba2',
                    '#f093fb',
                    '#f5576c',
                    '#4facfe'
                ],
                borderWidth: 0,
                cutout: '60%',
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                animateRotate: true,
                animateScale: true
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        font: { size: 12 }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#667eea',
                    borderWidth: 1,
                    cornerRadius: 8
                }
            }
        }
    });
}

// 3. GRÁFICO DE LINHA COM ÁREA GRADIENTE
// ======================================
function createElegantLineChart(ctx, data) {
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(102, 126, 234, 0.3)');
    gradient.addColorStop(1, 'rgba(102, 126, 234, 0.05)');

    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels || ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
            datasets: [{
                label: data.label || 'Receitas',
                data: data.values || [120, 135, 128, 145, 138, 155, 162, 158, 165, 172, 168, 178],
                borderColor: '#667eea',
                backgroundColor: gradient,
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#667eea',
                pointBorderColor: '#fff',
                pointBorderWidth: 3,
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 2000,
                easing: 'easeInOutQuart'
            },
            plugins: {
                legend: {
                    labels: { font: { size: 12, weight: '600' } }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#667eea',
                    borderWidth: 1,
                    cornerRadius: 8
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                        drawBorder: false
                    },
                    ticks: {
                        callback: (value) => `R$ ${value}K`,
                        font: { size: 11 }
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: { font: { size: 11, weight: '600' } }
                }
            }
        }
    });
}

// 4. GRÁFICO DE BARRAS HORIZONTAIS ELEGANTE
// ==========================================
function createElegantHorizontalBarChart(ctx, data) {
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels || ['João Silva', 'Maria Santos', 'Pedro Costa', 'Ana Oliveira', 'Carlos Lima'],
            datasets: [{
                label: data.label || 'Vendas (R$)',
                data: data.values || [125000, 118000, 105000, 98000, 92000],
                backgroundColor: [
                    'rgba(102, 126, 234, 0.8)',
                    'rgba(118, 75, 162, 0.8)',
                    'rgba(240, 147, 251, 0.8)',
                    'rgba(245, 87, 108, 0.8)',
                    'rgba(79, 172, 254, 0.8)'
                ],
                borderColor: [
                    '#667eea',
                    '#764ba2',
                    '#f093fb',
                    '#f5576c',
                    '#4facfe'
                ],
                borderWidth: 2,
                borderRadius: 6
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 2000,
                easing: 'easeInOutQuart'
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#667eea',
                    borderWidth: 1,
                    cornerRadius: 8
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                        drawBorder: false
                    },
                    ticks: {
                        callback: (value) => `R$ ${(value/1000).toFixed(0)}K`,
                        font: { size: 11 }
                    }
                },
                y: {
                    grid: { display: false },
                    ticks: { font: { size: 11, weight: '600' } }
                }
            }
        }
    });
}

// 5. GRÁFICO DE RADAR ELEGANTE
// =============================
function createElegantRadarChart(ctx, data) {
    return new Chart(ctx, {
        type: 'radar',
        data: {
            labels: data.labels || ['Vendas', 'Lucro', 'Clientes', 'Produtividade', 'Satisfação', 'Inovação'],
            datasets: [{
                label: data.targetLabel || 'Meta',
                data: data.targetValues || [90, 85, 95, 80, 88, 75],
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.2)',
                borderWidth: 3,
                pointBackgroundColor: '#667eea',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 6
            }, {
                label: data.currentLabel || 'Atual',
                data: data.currentValues || [75, 70, 85, 65, 80, 60],
                borderColor: '#764ba2',
                backgroundColor: 'rgba(118, 75, 162, 0.2)',
                borderWidth: 3,
                pointBackgroundColor: '#764ba2',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 2000,
                easing: 'easeInOutQuart'
            },
            plugins: {
                legend: {
                    labels: { font: { size: 12, weight: '600' } }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#667eea',
                    borderWidth: 1,
                    cornerRadius: 8
                }
            },
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        font: { size: 11 },
                        stepSize: 20
                    }
                }
            }
        }
    });
}

// 6. GRÁFICO DE TIMELINE ELEGANTE
// ================================
function createElegantTimelineChart(ctx, data) {
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels || ['2019', '2020', '2021', '2022', '2023', '2024'],
            datasets: [{
                label: data.dataset1Label || 'Faturamento',
                data: data.dataset1Values || [500, 650, 800, 950, 1200, 1450],
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 4,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#667eea',
                pointBorderColor: '#fff',
                pointBorderWidth: 3,
                pointRadius: 8,
                pointHoverRadius: 10
            }, {
                label: data.dataset2Label || 'Funcionários',
                data: data.dataset2Values || [5, 8, 12, 15, 18, 22],
                borderColor: '#764ba2',
                backgroundColor: 'rgba(118, 75, 162, 0.1)',
                borderWidth: 4,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#764ba2',
                pointBorderColor: '#fff',
                pointBorderWidth: 3,
                pointRadius: 8,
                pointHoverRadius: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 2000,
                easing: 'easeInOutQuart'
            },
            plugins: {
                legend: {
                    labels: { font: { size: 12, weight: '600' } }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#667eea',
                    borderWidth: 1,
                    cornerRadius: 8
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                        drawBorder: false
                    },
                    ticks: {
                        font: { size: 11 }
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: { font: { size: 11, weight: '600' } }
                }
            }
        }
    });
}

// 7. CONFIGURAÇÕES GLOBAIS ELEGANTES
// ===================================
function setupElegantChartDefaults() {
    // Configuração global do Chart.js
    Chart.defaults.font.family = 'Inter, -apple-system, BlinkMacSystemFont, sans-serif';
    Chart.defaults.color = '#64748b';
    Chart.defaults.plugins.legend.position = 'top';
    Chart.defaults.plugins.legend.labels.usePointStyle = true;
    Chart.defaults.plugins.legend.labels.padding = 20;
    
    // Cores elegantes para o tema
    const elegantColors = {
        primary: '#667eea',
        secondary: '#764ba2',
        accent1: '#f093fb',
        accent2: '#f5576c',
        accent3: '#4facfe',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#3b82f6'
    };
    
    return elegantColors;
}

// 8. EXEMPLO DE IMPLEMENTAÇÃO NO GESTOR PRO
// ==========================================
function implementElegantChartsInGestorPro() {
    // Configurar cores elegantes
    const colors = setupElegantChartDefaults();
    
    // Exemplo de implementação no dashboard
    const salesChartCtx = document.getElementById('salesChart');
    if (salesChartCtx) {
        const salesData = {
            labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
            previousYear: [45, 52, 48, 61, 55, 67, 72, 68, 75, 82, 78, 89],
            currentYear: [52, 58, 55, 68, 62, 75, 82, 78, 85, 92, 88, 98],
            previousYearLabel: '2023',
            currentYearLabel: '2024'
        };
        
        createElegantSalesChart(salesChartCtx.getContext('2d'), salesData);
    }
    
    // Exemplo de gráfico de produtos
    const productsChartCtx = document.getElementById('productsChart');
    if (productsChartCtx) {
        const productsData = {
            labels: ['Smartphones', 'Laptops', 'Tablets', 'Acessórios', 'Outros'],
            values: [35, 25, 20, 15, 5]
        };
        
        createElegantPieChart(productsChartCtx.getContext('2d'), productsData);
    }
}

// Exportar funções para uso global
window.ElegantCharts = {
    createElegantSalesChart,
    createElegantPieChart,
    createElegantLineChart,
    createElegantHorizontalBarChart,
    createElegantRadarChart,
    createElegantTimelineChart,
    setupElegantChartDefaults,
    implementElegantChartsInGestorPro
}; 