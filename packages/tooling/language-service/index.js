const { log } = require('./src/utils/logger');
const serviceInjection = require('./src/features/service-injection');
const templateValidation = require('./src/features/template-validation');
const pipeSupport = require('./src/features/pipe-support');
const templateSupport = require('./src/features/template-support');

function init(modules) {
    log('Plugin initialized');
    const ts = modules.typescript;

    function create(info) {
        log('Plugin created for project: ' + info.project.getProjectName());
        
        const proxy = Object.create(null);
        for (let k of Object.keys(info.languageService)) {
            const x = info.languageService[k];
            proxy[k] = (...args) => x.apply(info.languageService, args);
        }

        // 1. Intercept Completions
        proxy.getCompletionsAtPosition = (fileName, position, options) => {
            const prior = info.languageService.getCompletionsAtPosition(fileName, position, options);
            const withService = serviceInjection.getCompletions(info, fileName, position, prior);
            const withPipes = pipeSupport.getCompletions(info, fileName, position, withService);
            return templateSupport.getCompletions(info, fileName, position, withPipes);
        };

        // 2. Intercept Diagnostics
        proxy.getSemanticDiagnostics = (fileName) => {
            const prior = info.languageService.getSemanticDiagnostics(fileName);
            const withInjection = serviceInjection.getDiagnostics(info, fileName, prior);
            return templateValidation.getDiagnostics(info, fileName, withInjection);
        };

        // 3. Intercept Definition
        proxy.getDefinitionAndBoundSpan = (fileName, position) => {
            const prior = info.languageService.getDefinitionAndBoundSpan(fileName, position);
            const withService = serviceInjection.getDefinition(info, fileName, position, prior);
            const withPipes = pipeSupport.getDefinition(info, fileName, position, withService);
            return templateSupport.getDefinition(info, fileName, position, withPipes);
        };

        // 4. Intercept QuickInfo (Hover)
        proxy.getQuickInfoAtPosition = (fileName, position) => {
            const prior = info.languageService.getQuickInfoAtPosition(fileName, position);
            const withService = serviceInjection.getQuickInfo(info, fileName, position, prior);
            const withPipes = pipeSupport.getQuickInfo(info, fileName, position, withService);
            return templateSupport.getQuickInfo(info, fileName, position, withPipes);
        };

        return proxy;
    }

    return { create };
}

module.exports = init;
