import { useState, useCallback } from "react";
import type { Node } from "reactflow";
import Header from "./components/Header";
import FilterPanel from "./components/FilterPanel";
import Graph from "./components/Graph";
import Sidebar from "./components/Sidebar";
import DataCatalog from "./components/DataCatalog";

function App() {
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [filter, setFilter] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<'graph' | 'catalog'>('graph');

  const handleNodeClick = useCallback((node: Node) => {
    setSelectedNode(node);
  }, []);

  const handleClose = useCallback(() => setSelectedNode(null), []);

  const handleViewChange = useCallback((v: 'graph' | 'catalog') => {
    setView(v);
    if (v === 'catalog') setSelectedNode(null);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100vw", height: "100vh", overflow: "hidden" }}>
      <Header searchValue={search} onSearchChange={setSearch} />
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <FilterPanel active={filter} onChange={setFilter} currentView={view} onViewChange={handleViewChange} />
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          {view === 'graph' ? (
            <>
              <Graph filter={filter} searchTerm={search} onNodeClick={handleNodeClick} />
              {selectedNode && <Sidebar node={selectedNode} onClose={handleClose} />}
            </>
          ) : (
            <DataCatalog />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
