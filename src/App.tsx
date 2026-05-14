import { useState, useCallback } from "react";
import type { Node } from "reactflow";
import Header from "./components/Header";
import FilterPanel from "./components/FilterPanel";
import Graph from "./components/Graph";
import Sidebar from "./components/Sidebar";

function App() {
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [filter, setFilter] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const handleNodeClick = useCallback((node: Node) => {
    setSelectedNode(node);
  }, []);

  const handleClose = useCallback(() => setSelectedNode(null), []);

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100vw", height: "100vh", overflow: "hidden" }}>
      {/* Top header � AA branded */}
      <Header searchValue={search} onSearchChange={setSearch} />

      {/* Main area below header */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Left filter sidebar */}
        <FilterPanel active={filter} onChange={setFilter} />

        {/* Graph area � fills remaining space */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          <Graph filter={filter} searchTerm={search} onNodeClick={handleNodeClick} />
          {selectedNode && (
            <Sidebar node={selectedNode} onClose={handleClose} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
