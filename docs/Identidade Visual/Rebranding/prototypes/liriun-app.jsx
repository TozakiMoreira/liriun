// liriun-app.jsx — mounts the design canvas with three iPhone frames

const FRAME_W = 402;
const FRAME_H = 874;

function PhoneFrame({ children, label }) {
  return (
    <div style={{
      width: FRAME_W, height: FRAME_H, borderRadius: 56,
      position: 'relative', overflow: 'hidden',
      background: '#000',
      boxShadow: '0 50px 100px rgba(0,0,0,0.28), 0 0 0 1px rgba(0,0,0,0.18), inset 0 0 0 8px #1a1a1c',
      fontFamily: '-apple-system, system-ui',
    }}>
      {/* screen content */}
      <div style={{ position: 'absolute', inset: 8, borderRadius: 48, overflow: 'hidden', background: '#0E1014' }}>
        {children}
        {/* status bar overlay */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100 }}>
          <IOSStatusBar dark/>
        </div>
        {/* dynamic island */}
        <div style={{
          position: 'absolute', top: 11, left: '50%', transform: 'translateX(-50%)',
          width: 126, height: 37, borderRadius: 24, background: '#000', zIndex: 110,
        }}/>
        {/* home indicator */}
        <div style={{
          position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
          width: 139, height: 5, borderRadius: 99,
          background: 'rgba(255,255,255,0.7)', zIndex: 110,
        }}/>
      </div>
    </div>
  );
}

function App() {
  return (
    <DesignCanvas>
      <DCSection id="liriun" title="Liriun · iOS" subtitle="Assistente pessoal de tarefas por voz · 3 telas chave">
        <DCArtboard id="chat" label="01 · Conversa com Liriun" width={FRAME_W} height={FRAME_H}>
          <PhoneFrame><ScreenChat/></PhoneFrame>
        </DCArtboard>
        <DCArtboard id="list" label="02 · Tarefas" width={FRAME_W} height={FRAME_H}>
          <PhoneFrame><ScreenList/></PhoneFrame>
        </DCArtboard>
        <DCArtboard id="detail" label="03 · Detalhe da tarefa" width={FRAME_W} height={FRAME_H}>
          <PhoneFrame><ScreenDetail/></PhoneFrame>
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
