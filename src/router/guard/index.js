// Don't change the order of creation
export function setupRouterGuard(router) {
  createScrollGuard(router)
}

// Routing switch back to the top
function createScrollGuard(router) {
  const isHash = (href) => {
    return /^#/.test(href)
  }

  const body = document.body

  router.afterEach(async (to) => {
    // scroll top
    isHash(to.href) && body.scrollTo(0, 0)
    return true
  })
}
