import React from 'react';
import { createRoot } from 'react-dom/client';
import { FluentProvider, webDarkTheme, Title1, Text, Card } from '@fluentui/react-components';

function App() {
  return (
    <FluentProvider theme={webDarkTheme} style={{ minHeight: '100vh', background: '#07111f', color: '#fff' }}>
      <div style={{ padding: 32, display: 'grid', gap: 16 }}>
        <Title1>ODIC Platform Shell</Title1>
        <Text>Scaffolded engineering shell for workspace-driven implementation.</Text>
        <Card style={{ padding: 20, maxWidth: 900, background: '#0f1728' }}>
          <Text>
            Next implementation targets: workspace shell, global navigation, Organization workspace,
            Search workspace, and GIA integration surface.
          </Text>
        </Card>
      </div>
    </FluentProvider>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
