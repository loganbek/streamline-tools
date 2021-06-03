function parseEssentialDetails () {
  const main = {}
  main.bmlFileVars = JSON.parse(JSON.stringify(window.bmlFileVars)) || null
  return main
}

setInterval(() => {
  const essential = parseEssentialDetails()
  window.postMessage({ type: 'FROM_PAGE', essential })
}, 500)
