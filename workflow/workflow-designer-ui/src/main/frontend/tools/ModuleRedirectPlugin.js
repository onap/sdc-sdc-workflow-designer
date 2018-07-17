function ModuleRedirectPlugin (options) {
    options = options || {};
    this.intercept = options.intercept;
    this.redirect = options.redirect;
    this.ignore = options.ignore;
}

ModuleRedirectPlugin.prototype.apply = function (resolver) {
    resolver.plugin('described-resolve', (request, callback) => {
        if (!request.request.match(this.intercept) ||
            request.request.match(this.ignore)
        ) {
            return callback();
        }
        var newRequest = {
            ...request,
            request: request.request.replace(this.intercept, this.redirect)
        };
        resolver.doResolve(
            'resolve',
            newRequest,
            `Resolved request '${request.request}' to '${newRequest.request}'.`,
            callback
        );
    });
}

module.exports = ModuleRedirectPlugin;
