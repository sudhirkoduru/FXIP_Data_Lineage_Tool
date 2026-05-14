import { useState, useCallback } from "react";
import type { Node } from "reactflow";
import { ThemeProvider } from "./context/ThemeContext";
import Header from "./components/Header";
import FilterPanel from "./components/FilterPanel";
import Graph from "./components/Graph";
import Sidebar from "./components/Sidebar";
import DataCatalog from "./components/DataCatalog";
import Glossary from "./components/Glossary";

function AppInner() {
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [filter, setFilter] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"graph" | "catalog" | "glossary">("graph");

  const handleNodeClick = useCallback((node: Node) => { setSelectedNode(node); }, []);
  const handleClose = useCallback(() => setSelectedNode(null), []);
  const handleViewChange = useCallback((v: "graph" | "catalog" | "glossary") => {
    setView(v);
    if (v !== "graph") setSelectedNode(null);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100vw", height: "100vh", overflow: "hidden", background: "var(--c-bg-app)", transition: "background 0.25s ease" }}>
      <Header searchValue={search} onSearchChange={setSearch} />
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <FilterPanel active={filter} onChange={setFilter} currentView={view} onViewChange={handleViewChange} />
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          {view === "glossary" ? <Glossary /> : view === "catalog" ? <DataCatalog /> : (
            <>
              <Graph filter={filter} searchTerm={search} onNodeClick={handleNodeClick} />
              {selectedNode && <Sidebar node={selectedNode} onClose={handleClose} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}

export default App;
