import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Plus, Trash2, Download, Moon, Sun, Activity } from 'lucide-react';
import './Dashboard.css';

// --- MOCK APIs (As per requirements) ---

const Pathway_API = {
    fetchLatestExpenseUpdate: function() {
        return new Promise(resolve => {
            setTimeout(() => {
                const newExpense = Math.floor(Math.random() * 20000) + 5000;
                resolve({ latestMiscExpense: newExpense, timestamp: new Date().toLocaleTimeString() });
            }, 2500);
        });
    }
};

const Flexprice_API = {
    chargeForScenario: () => {
        console.log("FLEXPRICE BILLING: Charging user for 1 scenario simulation.");
    },
    chargeForReport: () => {
        console.log("FLEXPRICE BILLING: Charging user for 1 report export.");
    }
};

// --- Helper Functions & Initial Data ---
const createNewSheet = (name = "Untitled Sheet") => ({
    id: Date.now(),
    name,
    inputs: {
        monthlyRevenue: 500000,
        opEx: 120000,
        marketingEx: 75000,
        salariesEx: 250000,
        cashOnHand: 2000000,
    },
    scenario: {
        newHires: 0,
        marketingBoost: 0,
        priceChange: 0,
    },
    liveData: {
        latestMiscExpense: 0,
        lastUpdated: 'N/A',
    },
    usage: {
        scenariosTested: 0,
        reportsExported: 0,
    },
});

const PIE_COLORS = ['#0ea5e9', '#10b981', '#f97316', '#8b5cf6'];


// --- Main Dashboard Component ---
const CFO_Dashboard = () => {
    const [sheets, setSheets] = useState([createNewSheet("My Startup Budget (INR)")]);
    const [activeSheetId, setActiveSheetId] = useState(sheets.length > 0 ? sheets[0].id : null);
    const [darkMode, setDarkMode] = useState(false); // Defaulting to light mode

    const activeSheet = useMemo(() => sheets.find(s => s.id === activeSheetId), [sheets, activeSheetId]);

    const updateSheet = useCallback((sheetId, newValues) => {
        setSheets(prevSheets =>
            prevSheets.map(sheet =>
                sheet.id === sheetId ? { ...sheet, ...newValues } : sheet
            )
        );
    }, []);

    const handleInputChange = (field, value) => {
        const newInputs = { ...activeSheet.inputs, [field]: Number(value) || 0 };
        updateSheet(activeSheetId, { inputs: newInputs });
    };

    const handleScenarioChange = (field, value) => {
        const newScenario = { ...activeSheet.scenario, [field]: Number(value) || 0 };
        updateSheet(activeSheetId, { scenario: newScenario });
    };

    useEffect(() => {
        const interval = setInterval(() => {
            if (!activeSheetId) return;
            Pathway_API.fetchLatestExpenseUpdate().then(data => {
                const currentSheet = sheets.find(s => s.id === activeSheetId);
                if (currentSheet) {
                    const newLiveData = { latestMiscExpense: data.latestMiscExpense, lastUpdated: data.timestamp };
                    updateSheet(activeSheetId, { liveData: newLiveData });
                }
            });
        }, 10000);

        return () => clearInterval(interval);
    }, [activeSheetId, sheets, updateSheet]);

    const calculations = useMemo(() => {
        if (!activeSheet) return null;
        
        const { inputs, scenario, liveData } = activeSheet;
        
        const baseExpenses = inputs.opEx + inputs.marketingEx + inputs.salariesEx + liveData.latestMiscExpense;
        const baseProfit = inputs.monthlyRevenue - baseExpenses;
        const baseBurnRate = baseExpenses > inputs.monthlyRevenue ? baseExpenses - inputs.monthlyRevenue : 0;
        const baseRunway = baseBurnRate > 0 ? Math.floor(inputs.cashOnHand / baseBurnRate) : Infinity;

        const projectedRevenue = inputs.monthlyRevenue * (1 + scenario.priceChange / 100);
        const projectedSalaries = inputs.salariesEx + (scenario.newHires * 50000); // Assuming avg salary of ₹50k
        const projectedMarketing = inputs.marketingEx + scenario.marketingBoost;
        const projectedExpenses = inputs.opEx + projectedMarketing + projectedSalaries + liveData.latestMiscExpense;
        const projectedProfit = projectedRevenue - projectedExpenses;
        const projectedBurnRate = projectedExpenses > projectedRevenue ? projectedExpenses - projectedRevenue : 0;
        const projectedRunway = projectedBurnRate > 0 ? Math.floor(inputs.cashOnHand / projectedBurnRate) : Infinity;

        return {
            baseProfit,
            baseRunway,
            projectedRevenue,
            projectedExpenses,
            projectedProfit,
            projectedRunway,
            expenseBreakdownData: [
                { name: 'Operations', value: inputs.opEx },
                { name: 'Marketing', value: projectedMarketing },
                { name: 'Salaries', value: projectedSalaries },
                { name: 'Misc (Live)', value: liveData.latestMiscExpense },
            ],
            profitComparisonData: [
                { name: 'Profit/Loss', Base: baseProfit, Projected: projectedProfit }
            ]
        };
    }, [activeSheet]);


    const exportReport = () => {
        if (!calculations) return;
        Flexprice_API.chargeForReport();
        const newUsage = { ...activeSheet.usage, reportsExported: activeSheet.usage.reportsExported + 1 };
        updateSheet(activeSheetId, { usage: newUsage });
        
        const report = `
CFO Helper Report for: ${activeSheet.name}
------------------------------------------
Date: ${new Date().toLocaleDateString()}

--- Base Case ---
Monthly Revenue: ₹${activeSheet.inputs.monthlyRevenue.toLocaleString('en-IN')}
Total Monthly Expenses: ₹${(calculations.expenseBreakdownData.reduce((sum, item) => sum + item.value, 0) - activeSheet.scenario.marketingBoost - (activeSheet.scenario.newHires * 50000)).toLocaleString('en-IN')}
Base Monthly Profit/Loss: ₹${calculations.baseProfit.toLocaleString('en-IN')}
Financial Runway: ${isFinite(calculations.baseRunway) ? `${calculations.baseRunway} months` : 'Positive Cash Flow'}

--- Scenario Applied ---
New Hires: ${activeSheet.scenario.newHires} (Cost: ₹${(activeSheet.scenario.newHires * 50000).toLocaleString('en-IN')})
Marketing Boost: ₹${activeSheet.scenario.marketingBoost.toLocaleString('en-IN')}
Price Change: ${activeSheet.scenario.priceChange}%

--- Projected Outcome ---
Projected Monthly Revenue: ₹${calculations.projectedRevenue.toLocaleString('en-IN')}
Projected Total Monthly Expenses: ₹${calculations.projectedExpenses.toLocaleString('en-IN')}
Projected Monthly Profit/Loss: ₹${calculations.projectedProfit.toLocaleString('en-IN')}
Projected Financial Runway: ${isFinite(calculations.projectedRunway) ? `${calculations.projectedRunway} months` : 'Positive Cash Flow'}
        `;

        const blob = new Blob([report.trim()], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${activeSheet.name.replace(/\s/g, '_')}-report.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
    
    const addSheet = () => {
        const newName = prompt("Enter new sheet name:", `Financial Plan ${sheets.length + 1}`);
        if(newName) {
            const sheet = createNewSheet(newName);
            setSheets([...sheets, sheet]);
            setActiveSheetId(sheet.id);
        }
    };
    
    const deleteSheet = (sheetId) => {
        if(sheets.length > 1 && window.confirm("Are you sure you want to delete this sheet?")) {
            const newSheets = sheets.filter(s => s.id !== sheetId);
            setSheets(newSheets);
            if(activeSheetId === sheetId) {
                setActiveSheetId(newSheets.length > 0 ? newSheets[0].id : null);
            }
        } else if (sheets.length <= 1) {
            alert("You cannot delete the last sheet.");
        }
    };
    
    const themeClass = darkMode ? 'theme-dark' : 'theme-light';
    
    if (!activeSheet || !calculations) {
        return (
             <div className={`cfo-dashboard ${themeClass}`}>
                 <div className="no-sheet-view">
                     <h1>Welcome to CFO Helper</h1>
                     <p>Create your first financial sheet to get started.</p>
                     <button onClick={addSheet} className="btn-primary"><Plus/> Create First Sheet</button>
                 </div>
             </div>
        )
    }

    return (
        <div className={`cfo-dashboard ${themeClass}`}>
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h2>CFO Helper</h2>
                    <button onClick={() => setDarkMode(!darkMode)} className="theme-toggle">
                        {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                </div>
                <nav className="sheet-nav">
                    {sheets.map(sheet => (
                        <div key={sheet.id} className={`sheet-item ${sheet.id === activeSheetId ? 'active' : ''}`}>
                            <span onClick={() => setActiveSheetId(sheet.id)}>{sheet.name}</span>
                             <button onClick={() => deleteSheet(sheet.id)} className="delete-sheet-btn"><Trash2 size={14}/></button>
                        </div>
                    ))}
                </nav>
                <button onClick={addSheet} className="add-sheet-btn">
                    <Plus size={16} /> New Sheet
                </button>
            </aside>

            <main className="main-content">
                <header className="main-header">
                    <h1>{activeSheet.name}</h1>
                    <div className="usage-stats">
                        <span>Scenarios Tested: <strong>{activeSheet.usage.scenariosTested}</strong></span>
                        <span>Reports Exported: <strong>{activeSheet.usage.reportsExported}</strong></span>
                    </div>
                </header>
                
                <div className="dashboard-layout">
                    <div className="column-left">
                        <section className="card">
                            <h3 className="card-title">Base Financial Inputs</h3>
                            <div className="inputs-grid">
                                <div className="input-group"><label>Monthly Revenue (₹)</label><input type="number" value={activeSheet.inputs.monthlyRevenue} onChange={e => handleInputChange('monthlyRevenue', e.target.value)} /></div>
                                <div className="input-group"><label>Operations Expense (₹)</label><input type="number" value={activeSheet.inputs.opEx} onChange={e => handleInputChange('opEx', e.target.value)} /></div>
                                <div className="input-group"><label>Marketing Expense (₹)</label><input type="number" value={activeSheet.inputs.marketingEx} onChange={e => handleInputChange('marketingEx', e.target.value)} /></div>
                                <div className="input-group"><label>Salaries Expense (₹)</label><input type="number" value={activeSheet.inputs.salariesEx} onChange={e => handleInputChange('salariesEx', e.target.value)} /></div>
                                <div className="input-group full-width"><label>Total Cash on Hand (₹)</label><input type="number" value={activeSheet.inputs.cashOnHand} onChange={e => handleInputChange('cashOnHand', e.target.value)} /></div>
                                <div className="pathway-update-box full-width">
                                    <label>Live Misc. Expense (from Pathway)</label>
                                    <div className="pathway-value">₹{activeSheet.liveData.latestMiscExpense.toLocaleString('en-IN')}</div>
                                    <small>Last updated: {activeSheet.liveData.lastUpdated}</small>
                                </div>
                            </div>
                        </section>
                        
                        <section className="card">
                             <h3 className="card-title">"What-if" Scenario Simulator</h3>
                            <div className="scenario-grid">
                                <div className="slider-group">
                                    <label>Add. Marketing Spend: <strong>₹{activeSheet.scenario.marketingBoost.toLocaleString('en-IN')}</strong></label>
                                    <input type="range" min="0" max="200000" step="5000" value={activeSheet.scenario.marketingBoost} onChange={e => handleScenarioChange('marketingBoost', e.target.value)} />
                                </div>
                                <div className="slider-group">
                                    <label>New Hires (at ₹50k/mo each): <strong>{activeSheet.scenario.newHires}</strong></label>
                                    <input type="range" min="0" max="10" step="1" value={activeSheet.scenario.newHires} onChange={e => handleScenarioChange('newHires', e.target.value)} />
                                </div>
                                <div className="slider-group">
                                    <label>Product Price Change: <strong>{activeSheet.scenario.priceChange}%</strong></label>
                                    <input type="range" min="-50" max="50" step="5" value={activeSheet.scenario.priceChange} onChange={e => handleScenarioChange('priceChange', e.target.value)} />
                                </div>
                            </div>
                            <div className="scenario-actions">
                                <button onClick={() => alert("Scenario simulated! Check the 'Projected' values.")} className="btn-primary"><Activity size={16}/> Simulate Scenario</button>
                                <button onClick={exportReport} className="btn-secondary"><Download size={16}/> Export Report</button>
                            </div>
                        </section>
                    </div>

                    <div className="column-right">
                        <section className="kpi-grid">
                            <div className="card kpi-card">
                                 <p>Projected Monthly Profit</p>
                                 <h2 className={calculations.projectedProfit >= 0 ? 'positive' : 'negative'}>₹{calculations.projectedProfit.toLocaleString('en-IN')}</h2>
                                 <small>Base: ₹{calculations.baseProfit.toLocaleString('en-IN')}</small>
                            </div>
                             <div className="card kpi-card">
                                 <p>Projected Financial Runway</p>
                                  <h2 className={calculations.projectedRunway < 6 ? 'negative' : calculations.projectedRunway < 12 ? 'warning' : 'positive'}>{isFinite(calculations.projectedRunway) ? `${calculations.projectedRunway} months` : 'Infinite'}</h2>
                                 <small>Base: {isFinite(calculations.baseRunway) ? `${calculations.baseRunway} months` : 'Infinite'}</small>
                            </div>
                        </section>
                        
                        <section className="card chart-card">
                            <h3 className="card-title">Expense Breakdown (Projected)</h3>
                            <ResponsiveContainer width="100%" height={220}>
                                <RechartsPieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                    <Pie data={calculations.expenseBreakdownData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} labelLine={false}
                                    label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                                        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                        const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                                        const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                                        return (
                                            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12}>
                                                {`${(percent * 100).toFixed(0)}%`}
                                            </text>
                                        );
                                    }}>
                                        {calculations.expenseBreakdownData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                                    <Legend wrapperStyle={{fontSize: "14px"}}/>
                                </RechartsPieChart>
                            </ResponsiveContainer>
                        </section>

                        <section className="card chart-card">
                            <h3 className="card-title">Profitability (Base vs. Scenario)</h3>
                             <ResponsiveContainer width="100%" height={220}>
                                 <BarChart data={calculations.profitComparisonData} >
                                     <CartesianGrid strokeDasharray="3 3" />
                                     <XAxis dataKey="name" />
                                     <YAxis tickFormatter={(value) => `₹${value/1000}k`}/>
                                     <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                                     <Legend wrapperStyle={{fontSize: "14px"}}/>
                                     <Bar dataKey="Base" fill="var(--color-accent-2)" radius={[4, 4, 0, 0]}/>
                                     <Bar dataKey="Projected" fill="var(--color-accent-1)" radius={[4, 4, 0, 0]}/>
                                 </BarChart>
                            </ResponsiveContainer>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CFO_Dashboard;