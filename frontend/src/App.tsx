import { Routes, Route } from 'react-router-dom';
import Main from '@pages/main';
import Error from '@pages/error';
import Workspace from '@pages/workspace';

function App() {
	return (
		<Routes>
			<Route path="/" element={<Main />} />
			<Route path="/workspace" element={<Workspace />} />
			<Route path="/*" element={<Error />} />
		</Routes>
	);
}

export default App;
