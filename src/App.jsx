import { useEffect, useState } from "react";

export default function App() {
  const [bilar, setBilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_BASE = import.meta.env.VITE_API_URL || "/api";

  useEffect(() => {
    async function fetchBilar() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`${API_BASE}/bilar`);

        if (!res.ok) {
          throw new Error(`HTTP-fel: ${res.status}`);
        }

        const data = await res.json();
        setBilar(data);
      } catch (err) {
        setError(err.message || "Något gick fel vid hämtning.");
      } finally {
        setLoading(false);
      }
    }

    fetchBilar();
  }, []);

  return (
    <div className="container">
      <h1>Bilar till salu</h1>

      {loading && <p>Laddar...</p>}
      {error && <p className="error">{error}</p>}

      <div className="card-grid">
        {bilar.map((bil) => (
          <div className="card" key={bil._id || bil.reg}>
            <h2>{bil.brand}</h2>
            <p>
              <strong>Modell:</strong> {bil.model}
            </p>
            <p>
              <strong>Färg:</strong> {bil.color}
            </p>
            <p>
              <strong>Reg.nr:</strong> {bil.reg}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
