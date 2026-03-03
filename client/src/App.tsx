import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Upload from "./pages/Upload";
import History from "./pages/History";
import Settings from "./pages/Settings";

export default function App() {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route path="/" element={<Upload />} />
                <Route path="/history" element={<History />} />
                <Route path="/settings" element={<Settings />} />
            </Route>
        </Routes>
    );
}
