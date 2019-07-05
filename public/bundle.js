
(function(l, i, v, e) { v = l.createElement(i); v.async = 1; v.src = '//' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; e = l.getElementsByTagName(i)[0]; e.parentNode.insertBefore(v, e)})(document, 'script');
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.data !== data)
            text.data = data;
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function createEventDispatcher() {
        const component = current_component;
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment) {
            $$.update($$.dirty);
            run_all($$.before_update);
            $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            remaining: 0,
            callbacks: []
        };
    }
    function check_outros() {
        if (!outros.remaining) {
            run_all(outros.callbacks);
        }
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.callbacks.push(() => {
                outroing.delete(block);
                if (callback) {
                    block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        if (component.$$.fragment) {
            run_all(component.$$.on_destroy);
            component.$$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            component.$$.on_destroy = component.$$.fragment = null;
            component.$$.ctx = {};
        }
    }
    function make_dirty(component, key) {
        if (!component.$$.dirty) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty = blank_object();
        }
        component.$$.dirty[key] = true;
    }
    function init(component, options, instance, create_fragment, not_equal$$1, prop_names) {
        const parent_component = current_component;
        set_current_component(component);
        const props = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props: prop_names,
            update: noop,
            not_equal: not_equal$$1,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, props, (key, value) => {
                if ($$.ctx && not_equal$$1($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
            })
            : props;
        $$.update();
        ready = true;
        run_all($$.before_update);
        $$.fragment = create_fragment($$.ctx);
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    /* src/Header.svelte generated by Svelte v3.6.4 */

    const file = "src/Header.svelte";

    function create_fragment(ctx) {
    	var div, p, t1, input, t2, button, dispose;

    	return {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			p.textContent = "Search beers with Svelte and Punk API";
    			t1 = space();
    			input = element("input");
    			t2 = space();
    			button = element("button");
    			button.textContent = "Search";
    			attr(p, "class", "svelte-l2v3a5");
    			add_location(p, file, 19, 4, 530);
    			add_location(input, file, 20, 4, 579);
    			attr(button, "class", "svelte-l2v3a5");
    			add_location(button, file, 21, 4, 617);
    			attr(div, "id", "banner");
    			attr(div, "class", "svelte-l2v3a5");
    			add_location(div, file, 18, 0, 508);

    			dispose = [
    				listen(input, "input", ctx.input_input_handler),
    				listen(button, "click", ctx.search)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, p);
    			append(div, t1);
    			append(div, input);

    			input.value = ctx.searchTerm;

    			append(div, t2);
    			append(div, button);
    		},

    		p: function update(changed, ctx) {
    			if (changed.searchTerm && (input.value !== ctx.searchTerm)) input.value = ctx.searchTerm;
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			run_all(dispose);
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	const dispatch = createEventDispatcher();
        let { apiUrl } = $$props;
        let searchTerm = 'hops';
        
        async function search() {
            let searchUrl = `${apiUrl}?beer_name=${searchTerm}`;
            const response = await fetch(searchUrl);
            const json = await response.json();
            const headers = await response.headers;
            dispatch('gotBeers', {
                json: json,
                headers: headers
            });
        }

    	const writable_props = ['apiUrl'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		searchTerm = this.value;
    		$$invalidate('searchTerm', searchTerm);
    	}

    	$$self.$set = $$props => {
    		if ('apiUrl' in $$props) $$invalidate('apiUrl', apiUrl = $$props.apiUrl);
    	};

    	return {
    		apiUrl,
    		searchTerm,
    		search,
    		input_input_handler
    	};
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, ["apiUrl"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.apiUrl === undefined && !('apiUrl' in props)) {
    			console.warn("<Header> was created without expected prop 'apiUrl'");
    		}
    	}

    	get apiUrl() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set apiUrl(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Footer.svelte generated by Svelte v3.6.4 */

    const file$1 = "src/Footer.svelte";

    // (6:4) {#if numCalls}
    function create_if_block(ctx) {
    	var p0, t0, t1, t2, p1, t3, t4;

    	return {
    		c: function create() {
    			p0 = element("p");
    			t0 = text("Number of API calls per hour: ");
    			t1 = text(ctx.numCalls);
    			t2 = space();
    			p1 = element("p");
    			t3 = text("Number of API calls left this hour: ");
    			t4 = text(ctx.numCallsLeft);
    			add_location(p0, file$1, 6, 8, 118);
    			add_location(p1, file$1, 7, 8, 174);
    		},

    		m: function mount(target, anchor) {
    			insert(target, p0, anchor);
    			append(p0, t0);
    			append(p0, t1);
    			insert(target, t2, anchor);
    			insert(target, p1, anchor);
    			append(p1, t3);
    			append(p1, t4);
    		},

    		p: function update(changed, ctx) {
    			if (changed.numCalls) {
    				set_data(t1, ctx.numCalls);
    			}

    			if (changed.numCallsLeft) {
    				set_data(t4, ctx.numCallsLeft);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(p0);
    				detach(t2);
    				detach(p1);
    			}
    		}
    	};
    }

    function create_fragment$1(ctx) {
    	var div;

    	var if_block = (ctx.numCalls) && create_if_block(ctx);

    	return {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			attr(div, "id", "footer");
    			attr(div, "class", "svelte-axqhdy");
    			add_location(div, file$1, 4, 0, 73);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    		},

    		p: function update(changed, ctx) {
    			if (ctx.numCalls) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			if (if_block) if_block.d();
    		}
    	};
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { numCalls, numCallsLeft } = $$props;

    	const writable_props = ['numCalls', 'numCallsLeft'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('numCalls' in $$props) $$invalidate('numCalls', numCalls = $$props.numCalls);
    		if ('numCallsLeft' in $$props) $$invalidate('numCallsLeft', numCallsLeft = $$props.numCallsLeft);
    	};

    	return { numCalls, numCallsLeft };
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, ["numCalls", "numCallsLeft"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.numCalls === undefined && !('numCalls' in props)) {
    			console.warn("<Footer> was created without expected prop 'numCalls'");
    		}
    		if (ctx.numCallsLeft === undefined && !('numCallsLeft' in props)) {
    			console.warn("<Footer> was created without expected prop 'numCallsLeft'");
    		}
    	}

    	get numCalls() {
    		throw new Error("<Footer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set numCalls(value) {
    		throw new Error("<Footer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get numCallsLeft() {
    		throw new Error("<Footer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set numCallsLeft(value) {
    		throw new Error("<Footer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Beer.svelte generated by Svelte v3.6.4 */

    const file$2 = "src/Beer.svelte";

    function create_fragment$2(ctx) {
    	var div, p, t0_value = ctx.beer.name, t0, t1, img, img_src_value, img_alt_value, dispose;

    	return {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			img = element("img");
    			add_location(p, file$2, 9, 4, 181);
    			attr(img, "src", img_src_value = ctx.beer.image_url);
    			attr(img, "alt", img_alt_value = "A picture of the beer called " + ctx.beer.name + ".");
    			attr(img, "class", "svelte-1gf0cl4");
    			add_location(img, file$2, 10, 4, 204);
    			attr(div, "id", "beer");
    			attr(div, "class", "svelte-1gf0cl4");
    			add_location(div, file$2, 8, 0, 124);
    			dispose = listen(div, "click", ctx.click_handler);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, p);
    			append(p, t0);
    			append(div, t1);
    			append(div, img);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.beer) && t0_value !== (t0_value = ctx.beer.name)) {
    				set_data(t0, t0_value);
    			}

    			if ((changed.beer) && img_src_value !== (img_src_value = ctx.beer.image_url)) {
    				attr(img, "src", img_src_value);
    			}

    			if ((changed.beer) && img_alt_value !== (img_alt_value = "A picture of the beer called " + ctx.beer.name + ".")) {
    				attr(img, "alt", img_alt_value);
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			dispose();
    		}
    	};
    }

    function selectBeer(beerId) {
        alert(`Selected beer ${beerId}!`);
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { beer } = $$props;

    	const writable_props = ['beer'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Beer> was created with unknown prop '${key}'`);
    	});

    	function click_handler() {
    		return selectBeer(beer.id);
    	}

    	$$self.$set = $$props => {
    		if ('beer' in $$props) $$invalidate('beer', beer = $$props.beer);
    	};

    	return { beer, click_handler };
    }

    class Beer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, ["beer"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.beer === undefined && !('beer' in props)) {
    			console.warn("<Beer> was created without expected prop 'beer'");
    		}
    	}

    	get beer() {
    		throw new Error("<Beer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set beer(value) {
    		throw new Error("<Beer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.6.4 */

    const file$3 = "src/App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.beer = list[i];
    	return child_ctx;
    }

    // (23:0) {:else}
    function create_else_block(ctx) {
    	var p;

    	return {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Click Search in the header...";
    			add_location(p, file$3, 23, 1, 580);
    		},

    		m: function mount(target, anchor) {
    			insert(target, p, anchor);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(p);
    			}
    		}
    	};
    }

    // (19:0) {#if beers}
    function create_if_block_1(ctx) {
    	var each_1_anchor, current;

    	var each_value = ctx.beers;

    	var each_blocks = [];

    	for (var i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, () => {
    		each_blocks[i] = null;
    	});

    	return {
    		c: function create() {
    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert(target, each_1_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (changed.beers) {
    				each_value = ctx.beers;

    				for (var i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();
    				for (i = each_value.length; i < each_blocks.length; i += 1) out(i);
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			for (var i = 0; i < each_value.length; i += 1) transition_in(each_blocks[i]);

    			current = true;
    		},

    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);
    			for (let i = 0; i < each_blocks.length; i += 1) transition_out(each_blocks[i]);

    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);

    			if (detaching) {
    				detach(each_1_anchor);
    			}
    		}
    	};
    }

    // (20:1) {#each beers as beer}
    function create_each_block(ctx) {
    	var current;

    	var beer = new Beer({
    		props: { beer: ctx.beer },
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			beer.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(beer, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var beer_changes = {};
    			if (changed.beers) beer_changes.beer = ctx.beer;
    			beer.$set(beer_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(beer.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(beer.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(beer, detaching);
    		}
    	};
    }

    // (26:0) {#if numCalls}
    function create_if_block$1(ctx) {
    	var current;

    	var footer = new Footer({
    		props: {
    		numCalls: ctx.numCalls,
    		numCallsLeft: ctx.numCallsLeft
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			footer.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(footer, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var footer_changes = {};
    			if (changed.numCalls) footer_changes.numCalls = ctx.numCalls;
    			if (changed.numCallsLeft) footer_changes.numCallsLeft = ctx.numCallsLeft;
    			footer.$set(footer_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(footer.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(footer, detaching);
    		}
    	};
    }

    function create_fragment$3(ctx) {
    	var t0, current_block_type_index, if_block0, t1, if_block1_anchor, current;

    	var header = new Header({
    		props: { apiUrl: apiUrl },
    		$$inline: true
    	});
    	header.$on("gotBeers", ctx.gotBeers);

    	var if_block_creators = [
    		create_if_block_1,
    		create_else_block
    	];

    	var if_blocks = [];

    	function select_block_type(ctx) {
    		if (ctx.beers) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	var if_block1 = (ctx.numCalls) && create_if_block$1(ctx);

    	return {
    		c: function create() {
    			header.$$.fragment.c();
    			t0 = space();
    			if_block0.c();
    			t1 = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(header, target, anchor);
    			insert(target, t0, anchor);
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert(target, t1, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert(target, if_block1_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var header_changes = {};
    			if (changed.apiUrl) header_changes.apiUrl = apiUrl;
    			header.$set(header_changes);

    			var previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);
    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(changed, ctx);
    			} else {
    				group_outros();
    				transition_out(if_blocks[previous_block_index], 1, () => {
    					if_blocks[previous_block_index] = null;
    				});
    				check_outros();

    				if_block0 = if_blocks[current_block_type_index];
    				if (!if_block0) {
    					if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block0.c();
    				}
    				transition_in(if_block0, 1);
    				if_block0.m(t1.parentNode, t1);
    			}

    			if (ctx.numCalls) {
    				if (if_block1) {
    					if_block1.p(changed, ctx);
    					transition_in(if_block1, 1);
    				} else {
    					if_block1 = create_if_block$1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				group_outros();
    				transition_out(if_block1, 1, () => {
    					if_block1 = null;
    				});
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);

    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(header, detaching);

    			if (detaching) {
    				detach(t0);
    			}

    			if_blocks[current_block_type_index].d(detaching);

    			if (detaching) {
    				detach(t1);
    			}

    			if (if_block1) if_block1.d(detaching);

    			if (detaching) {
    				detach(if_block1_anchor);
    			}
    		}
    	};
    }

    let apiUrl = 'https://api.punkapi.com/v2/beers';

    function instance$3($$self, $$props, $$invalidate) {
    	
    	let beers;
    	let numCalls;
    	let numCallsLeft;

    	function gotBeers(event) {
    		$$invalidate('beers', beers = event.detail.json);
    		$$invalidate('numCalls', numCalls = event.detail.headers.get('x-ratelimit-limit'));
    		$$invalidate('numCallsLeft', numCallsLeft = event.detail.headers.get('x-ratelimit-remaining'));
    	}

    	return { beers, numCalls, numCallsLeft, gotBeers };
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, []);
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
