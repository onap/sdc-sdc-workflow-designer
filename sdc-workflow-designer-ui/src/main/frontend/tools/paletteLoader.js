/*
 * ============LICENSE_START=======================================================
 * SDC
 * ================================================================================
 * Copyright (C) 2026 Deutsche Telekom AG. All rights reserved.
 * ================================================================================
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ============LICENSE_END=========================================================
 */

// onap-ui-common 1.0.x, which this UI resolves from the public npm registry, still
// ships the palette that fails WCAG AA contrast; the releases with the fixed palette
// are published only to ONAP Nexus. This loader maps the compiled CSS to the colours
// those releases use.
// '%23' is the escaped '#' inside the SVG data URIs that draw the check boxes and radios
const COLOURS = [
    [/(#|%23)009fdb\b/gi, '056bae'],
    [/(#|%23)1eb9f3\b/gi, '0568ae'],
    [/(#|%23)959595\b/gi, '767676']
];

module.exports = function paletteLoader(css) {
    let out = css;
    COLOURS.forEach(([from, to]) => {
        out = out.replace(from, (match, hash) => hash + to);
    });
    // #d2d2d2 is also a fill and a shadow colour; only field and box edges need 3:1
    out = out.replace(/(border[\w-]*\s*:[^;{}]*?)#d2d2d2\b/gi, '$1#808080');
    return out.replace(/stroke%3D%22%23d2d2d2/gi, 'stroke%3D%22%23808080');
};
