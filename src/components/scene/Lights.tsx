function Lights() {
  return (
    <>
      <ambientLight intensity={0.15} />
      {/* Warm window light */}
      <pointLight position={[-2, 3, 2]} intensity={20} color="#ffb070" castShadow />
      {/* Cool monitor glow */}
      <pointLight position={[2, 1.5, -1]} intensity={6} color="#6aa8ff" />
    </>
  )
}

export default Lights
