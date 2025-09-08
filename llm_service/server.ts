import app from './src/app';
import { config } from './src/config';

const port = config.port;

app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`llm2_service listening on http://localhost:${port}`);
});
