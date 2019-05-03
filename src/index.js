const _ = require('lodash')
const jsdoc = require('jsdoc-api')


const {
  contentElements,
  contentRenderers,
  actions: builtinActions,
  setup: setupBuiltins
} = require('@botpress/builtins')

const renderers = require('./renderers')
const actions = require('./actions')


module.exports = async bp => {


async function registerBuiltin(bp) {
  await setupBuiltins(bp)

  // Register all the built-in content elements
  // Such as Carousel, Text, Choice etc..
  for (const schema of Object.values(contentElements)) {
    await bp.contentManager.loadCategoryFromSchema(schema)
  }

  await bp.contentManager.recomputeCategoriesMetadata()

  // Register all the renderers for the built-in elements
  for (const renderer of Object.keys(contentRenderers)) {
    bp.renderers.register(renderer, contentRenderers[renderer])
  }

  // Register all the built-in actions
  bp.dialogEngine.registerActions(builtinActions)
}

await registerBuiltin(bp)

  ////////////////////////////
  /// INITIALIZATION
  ////////////////////////////

  // Register all renderers
  Object.keys(renderers).forEach(name => {
    bp.renderers.register(name, renderers[name])
  })

  jsdoc.explain({ files: [__dirname + '/actions.js'] }).then(docs => {
    bp.dialogEngine.registerActionMetadataProvider(fnName => {
      const meta = docs.find(({ name }) => name === fnName)
      return {
        desciption: meta.description,
        params: (meta.params || [])
          .filter(({ name }) => name.startsWith('args.'))
          .map(arg => ({ ...arg, name: arg.name.replace('args.', '') }))
      }
    })
    bp.dialogEngine.registerFunctions(actions)

  })

  ////////////////////////////
  /// Conversation Management
  ////////////////////////////



  bp.hear(/\/forget/i, async (event, next) => {
    await bp.users.untag(event.user.id, 'nickname')
    // By not calling next() here, we "swallow" the event (won't be processed by the dialog engine below)
  })

  // All events that should be processed by the Flow Manager
  bp.hear({ type: /text|message|quick_reply/i }, (event, next) => {
    bp.dialogEngine.processMessage(event.sessionId || event.user.id, event).then()

    

  })
}
