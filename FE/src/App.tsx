import { ConfigProviderWrapper } from './config';
import Routes from './layouts/Routes';

function App() {
  return (
    <ConfigProviderWrapper>
      <Routes />
    </ConfigProviderWrapper>
  );
}

export default App;
