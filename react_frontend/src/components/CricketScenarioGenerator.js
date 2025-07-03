import React, { useState, useRef } from "react";
import {
  PieChart, Pie, Cell, Tooltip as RTooltip, Legend as RLegend, BarChart, XAxis, YAxis, Bar, ResponsiveContainer
} from "recharts";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from "chart.js";
import { Bar as ChartBar } from "react-chartjs-2";
import "./CricketScenarioGenerator.css";

// Register chart.js components for react-chartjs-2
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

// Pie chart colors
const PIE_COLORS = ["#1976D2", "#FF4081", "#42C38B", "#FFA541", "#e87199", "#1da486"];

const INITIAL_FORM = {
  matchFormat: "ODI",
  tournament: "",
  numScenarios: 3,
  questionType: "What happens next?",
  teamA: "",
  teamB: "",
  playerFocus: "",
  situation: ""
};

const QUESTION_TYPES = [
  "What happens next?",
  "Probability of outcome",
  "Best choice for next action"
];

// PUBLIC_INTERFACE
/**
 * Main Cricket Scenario Generator UI and logic.
 * All-in-one workflow: match config + scenario/question generation + voting + results + analytics/history.
 */
function CricketScenarioGenerator() {
  // Form state
  const [form, setForm] = useState({ ...INITIAL_FORM });
  const [formTouched, setFormTouched] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Scenario & question state
  const [scenarios, setScenarios] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState({}); // {scenarioIndex: "yes"/"no"}
  const [pollResults, setPollResults] = useState({}); // {scenarioIndex: {yes: n, no: n}}
  const [pollHistory, setPollHistory] = useState([]); // [{time, config, scenarios, resultSummary}]
  const [analytics, setAnalytics] = useState(null);

  // UI state
  const [showResults, setShowResults] = useState(false);
  const [submittingVote, setSubmittingVote] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const regenerateAllRef = useRef();

  // Simulate backend API endpoint URL root (replace with process.env or config if needed)
  const API_ROOT = process.env.REACT_APP_BACKEND_URL || "http://localhost:3001"; // default Flask backend

  // PUBLIC_INTERFACE
  function handleInputChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFormTouched(true);
    setError("");
  }

  // PUBLIC_INTERFACE
  function handleNumberChange(e) {
    let value = parseInt(e.target.value, 10) || 1;
    if (value < 1) value = 1;
    if (value > 5) value = 5;
    setForm({ ...form, numScenarios: value });
    setFormTouched(true);
  }

  // PUBLIC_INTERFACE
  // Generate cricket scenarios (questions) via backend REST endpoint
  async function generateScenarios(e) {
    e.preventDefault();
    setError("");
    setStatus("");
    setGenerating(true);
    setScenarios([]);
    setShowResults(false);
    setSelectedOptions({});
    setPollResults({});
    setAnalytics(null);
    try {
      const resp = await fetch(
        `${API_ROOT}/api/generate_scenarios`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form)
        }
      );
      if (!resp.ok) throw new Error("Backend error generating scenarios.");
      const data = await resp.json();
      // data: {scenarios: [{context, question, index}]}
      setScenarios(
        (data.scenarios || []).map((s, idx) => ({
          ...s,
          index: idx
        }))
      );
      setStatus("Scenarios/questions generated!");
    } catch (err) {
      setError(`Failed to generate scenarios: ${err.message}`);
    }
    setGenerating(false);
  }

  // PUBLIC_INTERFACE
  // User selects Yes/No for a scenario/question (per scenario polling)
  function handleVoteOption(index, option) {
    setSelectedOptions({ ...selectedOptions, [index]: option });
    setError("");
  }

  // PUBLIC_INTERFACE
  // Submit vote to backend and show results
  async function handleVoteSubmit(index) {
    if (!(index in selectedOptions)) {
      setError(`Please select Yes or No for scenario ${index + 1}.`);
      return;
    }
    setSubmittingVote(true);
    setError("");
    setStatus("");
    try {
      const resp = await fetch(
        `${API_ROOT}/api/vote`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scenario_index: index,
            choice: selectedOptions[index]
          })
        }
      );
      if (!resp.ok) throw new Error("Backend error on voting.");
      const data = await resp.json();
      // data: {results: {yes: n, no: n}}
      setPollResults((prev) => ({
        ...prev,
        [index]: { ...data.results }
      }));
      setShowResults(true);
      setStatus(`Vote submitted for Question ${index + 1}!`);
    } catch (err) {
      setError(`Failed to submit vote: ${err.message}`);
    }
    setSubmittingVote(false);
  }

  // PUBLIC_INTERFACE
  // Fetch poll analytics and history
  async function fetchHistoryAndAnalytics() {
    setError("");
    try {
      const [historyResp, analyticsResp] = await Promise.all([
        fetch(`${API_ROOT}/api/poll_history`),
        fetch(`${API_ROOT}/api/poll_analytics`)
      ]);
      let history = [], analyticsData = null;
      if (historyResp.ok) {
        history = await historyResp.json();
      }
      if (analyticsResp.ok) {
        analyticsData = await analyticsResp.json();
      }
      setPollHistory(history);
      setAnalytics(analyticsData);
    } catch (err) {
      setError("Failed to fetch poll analytics or history");
    }
  }

  // PUBLIC_INTERFACE
  // Regenerate all scenarios (reset to form)
  function handleRegenerate() {
    setForm({ ...INITIAL_FORM });
    setFormTouched(false);
    setScenarios([]);
    setSelectedOptions({});
    setPollResults({});
    setShowResults(false);
    setAnalytics(null);
    setStatus("Form reset. Start a new session.");
    setError("");
    // Scroll to form
    if (regenerateAllRef.current) {
      regenerateAllRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }

  // On mount, show analytics/history for landing view
  React.useEffect(() => {
    fetchHistoryAndAnalytics();
    // eslint-disable-next-line
  }, []);

  // On poll result update, refresh analytics/history
  React.useEffect(() => {
    if (showResults) {
      fetchHistoryAndAnalytics();
    }
    // eslint-disable-next-line
  }, [pollResults, showResults]);

  // ---------- UI ----------

  // Scenario poll results metrics as chart data
  function getScenarioChartData(index) {
    const result = pollResults[index] || { yes: 0, no: 0 };
    return [
      { name: "Yes", value: result.yes || 0 },
      { name: "No", value: result.no || 0 }
    ];
  }

  return (
    <div className="cricket-generator-root">
      <section className="generator-section" ref={regenerateAllRef}>
        <h2 className="section-title">Cricket Scenario Generator</h2>
        {/* Match Config Form */}
        <form className="scenario-form" onSubmit={generateScenarios} autoComplete="off">
          <div className="form-row">
            <label>Match Format</label>
            <select name="matchFormat" value={form.matchFormat} onChange={handleInputChange} required>
              <option value="ODI">ODI</option>
              <option value="Test">Test</option>
              <option value="T20">T20</option>
            </select>
          </div>
          <div className="form-row">
            <label>Tournament</label>
            <input name="tournament" type="text" value={form.tournament} onChange={handleInputChange} required />
          </div>
          <div className="form-row">
            <label>Number of Scenarios</label>
            <input
              name="numScenarios"
              type="number"
              value={form.numScenarios}
              min={1}
              max={5}
              step={1}
              onChange={handleNumberChange}
              required
            />
          </div>
          <div className="form-row">
            <label>Question Type</label>
            <select name="questionType" value={form.questionType} onChange={handleInputChange} required>
              {QUESTION_TYPES.map((q, i) => (
                <option key={i} value={q}>{q}</option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <label>Team A</label>
            <input name="teamA" type="text" value={form.teamA} onChange={handleInputChange} required />
          </div>
          <div className="form-row">
            <label>Team B</label>
            <input name="teamB" type="text" value={form.teamB} onChange={handleInputChange} required />
          </div>
          <div className="form-row">
            <label>Player Focus</label>
            <input name="playerFocus" type="text" value={form.playerFocus} onChange={handleInputChange} />
          </div>
          <div className="form-row">
            <label>Situation (context)</label>
            <textarea name="situation" rows={2} value={form.situation} onChange={handleInputChange} />
          </div>
          <div className="form-actions">
            <button type="submit" disabled={generating}>
              {generating ? "Generating..." : "Generate Scenarios"}
            </button>
            <button type="button" className="btn-secondary" onClick={handleRegenerate}>
              Regenerate All Scenarios
            </button>
          </div>
        </form>
        {(error || status) && <div className={error ? "error-message" : "status-message"}>{error || status}</div>}
      </section>

      {/* Scenarios/Questions + Voting */}
      {scenarios.length > 0 && (
        <section className="scenarios-section">
          <h3 className="section-subtitle">Generated Scenarios & Questions</h3>
          <ul className="scenario-list">
            {scenarios.map((s, idx) => (
              <li key={idx} className="scenario-item">
                <div className="scenario-context">
                  <strong>Context:</strong> {s.context}
                </div>
                <div className="scenario-question">
                  <strong>Q{idx + 1}:</strong> {s.question}
                </div>
                <div className="scenario-vote">
                  <span>Vote:</span>
                  <label>
                    <input
                      type="radio"
                      name={`vote-${idx}`}
                      checked={selectedOptions[idx] === "yes"}
                      onChange={() => handleVoteOption(idx, "yes")}
                      disabled={showResults}
                    />
                    Yes
                  </label>
                  <label>
                    <input
                      type="radio"
                      name={`vote-${idx}`}
                      checked={selectedOptions[idx] === "no"}
                      onChange={() => handleVoteOption(idx, "no")}
                      disabled={showResults}
                    />
                    No
                  </label>
                  <button
                    className="btn-small"
                    onClick={() => handleVoteSubmit(idx)}
                    disabled={submittingVote || showResults}
                  >
                    {submittingVote ? "Submitting..." : "Vote / Show Results"}
                  </button>
                </div>
                {/* Results (Pie/Bar Charts) */}
                {showResults && pollResults[idx] && (
                  <div className="scenario-result">
                    <div className="metrics">
                      <span className="metric-yes">Yes: {pollResults[idx].yes || 0}</span>
                      <span className="metric-no">No: {pollResults[idx].no || 0}</span>
                    </div>
                    <div className="charts-row">
                      <ResponsiveContainer width="100%" height={150}>
                        <PieChart>
                          <Pie
                            data={getScenarioChartData(idx)}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={45}
                            innerRadius={20}
                            fill="#1976D2"
                            label
                          >
                            {getScenarioChartData(idx).map((entry, i) => (
                              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <RTooltip />
                          <RLegend />
                        </PieChart>
                      </ResponsiveContainer>
                      <ResponsiveContainer width="100%" height={150}>
                        <BarChart data={getScenarioChartData(idx)}>
                          <XAxis dataKey="name" />
                          <YAxis allowDecimals={false} />
                          <Bar dataKey="value" fill="#FFA541" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Poll Analytics and History */}
      <section className="analytics-section">
        <h3 className="section-subtitle">Poll Analytics & Recent History</h3>
        <div className="analytics-panels">
          {/* Analytics summary metrics */}
          <div className="analytics-summary">
            {analytics ? (
              <>
                <div className="metric-row">
                  <span>Total Polls:</span>
                  <b>{analytics.total_polls}</b>
                </div>
                <div className="metric-row">
                  <span>Unique Questions:</span>
                  <b>{analytics.unique_questions}</b>
                </div>
                <div className="metric-row">
                  <span>Most Popular:</span>
                  <b>{analytics.most_popular_q || "N/A"}</b>
                </div>
              </>
            ) : (
              <span>Loading analytics...</span>
            )}
          </div>
          {/* Analytics chart: breakdown by question type */}
          <div className="analytics-breakdown">
            {analytics && analytics.question_type_breakdown ? (
              <ChartBar
                data={{
                  labels: Object.keys(analytics.question_type_breakdown),
                  datasets: [
                    {
                      label: "Poll Count",
                      data: Object.values(analytics.question_type_breakdown),
                      backgroundColor: PIE_COLORS
                    }
                  ]
                }}
                height={170}
                options={{
                  plugins: { legend: { display: false } },
                  indexAxis: 'y',
                  responsive: true,
                  scales: {
                    x: { beginAtZero: true },
                    y: { ticks: { font: { size: 13 } } }
                  }
                }}
              />
            ) : (
              <span>Chart loading...</span>
            )}
          </div>
        </div>
        {/* Recent poll table */}
        <div className="history-table-panel">
          <h4>Recent Poll History</h4>
          <table className="history-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Time</th>
                <th>Question Type</th>
                <th>Teams</th>
                <th>Scenario/Question</th>
                <th>Yes</th>
                <th>No</th>
              </tr>
            </thead>
            <tbody>
              {(pollHistory?.slice?.(0, 8) || []).map((h, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{h.time || "--"}</td>
                  <td>{h.question_type || "--"}</td>
                  <td>{h.teams || "--"}</td>
                  <td>{h.question || "--"}</td>
                  <td>{h.yes ?? 0}</td>
                  <td>{h.no ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default CricketScenarioGenerator;
