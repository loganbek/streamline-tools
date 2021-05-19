function parseEssentialDetails () {
  let main = {}
  main.bmlFileVars = JSON.parse(JSON.stringify(window.bmlFileVars)) || null
  return main
}

setInterval(() => {
  let essential = parseEssentialDetails()
  window.postMessage({ type: 'FROM_PAGE', essential })
}, 500)
