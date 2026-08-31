import { hydrate } from '@solidjs/web';
import App from './App';
import AppFixed from './AppFixed';

const root = document.getElementById('root');
if (!root) throw new Error('no root');
const Root = location.search.includes('fix') ? AppFixed : App;
hydrate(() => <Root />, root);
