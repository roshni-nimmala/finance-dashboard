import { useState, useEffect } from "react";
import "./index.css";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

function App() {
   const [darkMode, setDarkMode] = useState(false);
  const [role, setRole] = useState("viewer");

  const toggleRole = () => {
    setRole(role === "viewer" ? "admin" : "viewer");
  };

  // ✅ Load from localStorage
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem("transactions");
    return saved ? JSON.parse(saved) : [];
  });

  // ✅ Totals
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);

  const savings = income - expense;

  // ✅ Current month
  const currentMonth = new Date().getMonth();

  // ✅ Monthly values for cards
  let currentIncome = 0;
  let currentExpense = 0;

  transactions.forEach((t) => {
    const m = new Date(t.date).getMonth();
    if (m === currentMonth) {
      if (t.type === "income") currentIncome += t.amount;
      else currentExpense += t.amount;
    }
  });

  const currentSavings = currentIncome - currentExpense;

  // ✅ Form
  const [form, setForm] = useState({
    date: "",
    amount: "",
    category: "",
    type: "income",
  });

  // ✅ Filters
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterMonth, setFilterMonth] = useState("all");

  // ✅ Calculate totals
  useEffect(() => {
    let inc = 0;
    let exp = 0;

    transactions.forEach((t) => {
      if (t.type === "income") inc += t.amount;
      else exp += t.amount;
    });

    setIncome(inc);
    setExpense(exp);
  }, [transactions]);

  // ✅ Save to localStorage
  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  // ✅ Handle input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ Add transaction
  const handleSubmit = (e) => {
    e.preventDefault();

    const amt = Number(form.amount);
    if (!amt) return;

    const newTransaction = {
      id: Date.now(),
      date: form.date,
      category: form.category,
      amount: amt,
      type: form.type,
    };

    setTransactions([newTransaction, ...transactions]);

    setForm({
      date: "",
      amount: "",
      category: "",
      type: "income",
    });
  };

  // ✅ Filter logic
  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = t.category
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesType =
      filterType === "all" || t.type === filterType;

    const matchesMonth =
      filterMonth === "all" ||
      new Date(t.date).getMonth() === Number(filterMonth);

    return matchesSearch && matchesType && matchesMonth;
  });

  // 📈 Monthly Data
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    let inc = 0;
    let exp = 0;

    transactions.forEach((t) => {
      const month = new Date(t.date).getMonth();
      if (month === i) {
        if (t.type === "income") inc += t.amount;
        else exp += t.amount;
      }
    });

    return {
      month: new Date(0, i).toLocaleString("default", {
        month: "short",
      }),
      income: inc,
      expense: exp,
      savings: inc - exp,
    };
  });

  // 🥧 Category Data (current month)
  const categoryMap = {};

  transactions.forEach((t) => {
    const month = new Date(t.date).getMonth();
    if (month === currentMonth && t.type === "expense") {
      categoryMap[t.category] =
        (categoryMap[t.category] || 0) + t.amount;
    }
  });

  const categoryData = Object.keys(categoryMap).map((key) => ({
    name: key,
    value: categoryMap[key],
  }));

  // 🎨 Dynamic colors
  const getColor = (index) => {
    const hue = (index * 60) % 360;
    return `hsl(${hue}, 65%, 55%)`;
  };

  // 📊 Insights
  let topCategory = "N/A";
  let maxCategoryValue = 0;

  categoryData.forEach((c) => {
    if (c.value > maxCategoryValue) {
      maxCategoryValue = c.value;
      topCategory = c.name;
    }
  });

  let maxMonth = "N/A";
  let maxExpense = 0;

  monthlyData.forEach((m) => {
    if (m.expense > maxExpense) {
      maxExpense = m.expense;
      maxMonth = m.month;
    }
  });

  const avgExpense =
    transactions.length > 0
      ? Math.round(expense / transactions.length)
      : 0;

  const totalCategoryMap = {};

  transactions.forEach((t) => {
    if (t.type === "expense") {
      totalCategoryMap[t.category] =
        (totalCategoryMap[t.category] || 0) + t.amount;
    }
  });

  const topCategories = Object.entries(totalCategoryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;

  let lastIncome = 0;
  let lastExpense = 0;

  transactions.forEach((t) => {
    const m = new Date(t.date).getMonth();
    if (m === lastMonth ) {
      if (t.type === "income") lastIncome += t.amount;
      else lastExpense += t.amount;
    }
  });

  const percentChange = (curr, prev) => {
    if (prev === 0) return 0;
    return (((curr - prev) / prev) * 100).toFixed(1);
  };

  return (
    <div className={`app ${darkMode ? "dark" : ""}`}>

      {/* HEADER */}
      <div className="header">
        <h1 className="title">💰 Finance Dashboard</h1>
        <p className="subtitle">Track and manage your finances easily</p>
      </div>
        <button 
  className="dark-btn"
  onClick={() => setDarkMode(!darkMode)}
>
  {darkMode ? "☀️ Light" : "🌙 Dark"}
</button>
      {/* NAVBAR */}
      <div className="navbar">
        <div className="nav">
          <p>viewer</p>
          <div
            className={`toggle-container ${role === "admin" ? "admin" : ""}`}
            onClick={toggleRole}
          >
            <div
              className={`toggle-circle ${role === "admin" ? "admin" : ""}`}
            ></div>
          </div>
          <p>admin</p>
          
        </div>

        <p className="role-text">
          {role === "viewer"
            ? "Viewer Mode: You can only view data."
            : "Admin Mode: You can add and manage transactions."}
        </p>
      </div>

      {/* CARDS */}
      <div className="cards">
        <div className="card expense">
          <h3>💸 This Month Expense</h3>
          <p>₹{currentExpense}</p>
        </div>

        <div className="card income">
          <h3>💰 This Month Income</h3>
          <p>₹{currentIncome}</p>
        </div>

        <div className="card savings">
          <h3>🏦 This Month Savings</h3>
          <p>
            {currentSavings < 0
              ? "No savings yet"
              : `₹${currentSavings}`}
          </p>
        </div>
      </div>

      {/* FORM */}
      {role === "admin" && (
        <div className="card form-card">
          <h3>➕ Add Transaction</h3>

          <form onSubmit={handleSubmit} className="form">
            <input type="date" name="date" value={form.date} onChange={handleChange} required />
            <input type="number" name="amount" placeholder="Amount" value={form.amount} onChange={handleChange} required />
            <input type="text" name="category" placeholder="Category" value={form.category} onChange={handleChange} required />

            <div className="type-toggle">
              <button type="button" className={form.type === "income" ? "active" : ""} onClick={() => setForm({ ...form, type: "income" })}>+</button>
              <button type="button" className={form.type === "expense" ? "active" : ""} onClick={() => setForm({ ...form, type: "expense" })}>-</button>
            </div>

            <button type="submit" className="add-btn">Add</button>
          </form>
        </div>
      )}

      {/* TRANSACTIONS */}
      <div className="card transaction-list">
        <h3>📊 Transactions</h3>

        <div className="filters">
          <input
            type="text"
            placeholder="Search category"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">All</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <select onChange={(e) => setFilterMonth(e.target.value)}>
            <option value="all">All Months</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i}>
                {new Date(0, i).toLocaleString("default", { month: "short" })}
              </option>
            ))}
          </select>
        </div>

        {filteredTransactions.length === 0 ? (
          <p>No transactions found</p>
        ) : (
          <ul>
            {filteredTransactions.map((t) => (
              <li key={t.id} className={t.type}>
                <div className="transaction-info">
                  <span className="category">{t.category}</span>
                  <span className="date">{t.date}</span>
                </div>

                <span className="amount">
                  {t.type === "income" ? "+" : "-"}₹{t.amount}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* CHARTS */}
      <div className="charts">
        <div className="chart-card">
          <h3>📈 Monthly Overview</h3>

          {transactions.length === 0 ? (
            <p>No data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="income" stroke="#2e7d32" strokeWidth={3} />
                <Line type="monotone" dataKey="expense" stroke="#c62828" strokeWidth={3} />
                <Line type="monotone" dataKey="savings" stroke="#1565c0" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="chart-card">
          <h3>🥧 Category Breakdown</h3>

          {categoryData.length === 0 ? (
            <p>No expense data this month</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" outerRadius={80}>
                  {categoryData.map((_, index) => (
                    <Cell key={index} fill={getColor(index)} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* INSIGHTS */}
      <div className="insights">
        <h2> 🪙Smart Insights</h2>

        {transactions.length === 0 ? (
          <p>No data available to generate insights</p>
        ) : (
          <div className="insight-grid">

            <div className="insight-card">
              <h4>Top expense Category</h4>
              <p>{topCategory}</p>
            </div>

            <div className="insight-card">
              <h4>Highest Spending Month</h4>
              <p>{maxMonth}</p>
            </div>

            <div className="insight-card">
              <h4>Avg Expense</h4>
              <p>₹{avgExpense}</p>
            </div>

            <div className="insight-card">
              <h4>Top 3 Categories</h4>
              <ul>
                {topCategories.map((c, i) => (
                  <li key={i}>{c[0]} (₹{c[1]})</li>
                ))}
              </ul>
            </div>

           

          </div>
        )}
      </div>

    </div>
  );
}

export default App;