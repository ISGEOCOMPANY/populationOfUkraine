var Utils = {
    capString: function (o) {
        return o.substring && o.length && (o = o.substring(0, 1).toUpperCase() + o.substring(1)), o
    }, hasClass: function (o, i) {
        var t = L.DomUtil.hasClass;
        for (var n in i) if (t(o, i[n])) return !0;
        return !1
    }, beginClass: function (o, i) {
        if (o.className && i && o.className.indexOf && o.className.indexOf(i) !== -1) return !0
    }, getIconLabelHtml: function (o, i) {
        var t = ['<span style="color: ' + i + ';">' + o + "</span>"].join("");
        return t
    }, getLayerById: function (o) {
        var i = null;
        return this.mainLayer.eachLayer(function (t) {
            if (t.options.id === o) return void(i = t)
        }), i
    }, setUpColor: function () {
        this.options.color.indexOf("#") === -1 && (this.options.color = "#" + this.options.color), this.options.fillColor.indexOf("#") === -1 && (this.options.fillColor = "#" + this.options.fillColor), this.includeColor(this.options.color), this.includeColor(this.options.fillColor)
    }, includeColor: function (o) {
        var i = !1;
        for (var t in this.options.pallette) this.options.pallette[t] === o && (i = !0);
        i || this.options.pallette.push(o)
    }
};
!function () {
    L.Class.Feature = L.Class.extend({
        statics: {}, includes: [Utils], initialize: function (t) {
            L.Util.extend(this.options, t.options), this.options.color = t.options.color, this.core = t, this.a = t.a
        }, destroy: function () {
        }, isEnabled: function () {
            var t = this.options.name;
            return this[t + "Enable"]
        }, enableFeature: function () {
            var t = this.options.name;
            this[t + "Enable"] = !0
        }, disableFeature: function () {
            var t = this.options.name;
            this[t + "Enable"] = !1
        }, resetFeature: function () {
        }, onClick: function (t) {
            this.core.layer || this.core.initLayer()
        }, reorderFeatures: function (t, e) {
            for (var i in e.featureList) if (e.featureList[i].options.name === t) {
                e.featureList.splice(parseInt(i), 1), e.featureList.unshift(this);
                break
            }
        }, onDblClick: function (t) {
        }, onMove: function (t) {
        }, onDraw: function (t, e, i, o) {
        }, onRedraw: function (t, e, i) {
        }, onRenderNode: function (t, e, i) {
        }, onSelect: function (t) {
        }
    })
}(), function () {
    L.Class.ControlFeature = L.Class.Feature.extend({
        options: {type: "control"}, initialize: function (t) {
            L.Class.Feature.prototype.initialize.call(this, t);
            var e = this, i = this.options.name, o = this.disableFeature, n = this.enableFeature;
            this.capString(i);
            this.a = t.a, 1 === t.originalFeaturesCount ? t.features[0] === this.options.name && L.Class.Feature.prototype.enableFeature.call(this) : (this.control = L.DomUtil.create("a", "icon-" + i, t.container), this.control.href = "#", this.control.title = "", L.DomEvent.on(this.control, "click", function () {
                e[i + "Enable"] ? o.call(e) : n.call(e)
            })), this.options.type = "control"
        }, destroy: function () {
            this.control && L.DomUtil.remove(this.control)
        }, isEnabled: function () {
            var t = this.options.name;
            return this[t + "Enable"]
        }, resetOtherControlFeatures: function () {
            var t = this.core.featureList;
            for (var e in t) "control" === t[e].options.type && t[e].disableFeature()
        }, enableFeature: function () {
            this.resetOtherControlFeatures(), L.Class.Feature.prototype.enableFeature.call(this), L.DomUtil.addClass(this.control, "sub-icon-active")
        }, disableFeature: function () {
            L.Class.Feature.prototype.disableFeature.call(this), L.DomUtil.removeClass(this.control, "sub-icon-active")
        }, onClick: function (t) {
            this.core.layer.options.type = this.options.name, this.core.layer.options.title = "Untitled", this.core.layer.options.description = "...", this.core.selectedLayer = this.core.layer, L.Class.Feature.prototype.onClick.call(this, t);
            var e = t.originalEvent.target, i = t.originalEvent.target;
            return !this.beginClass(i, ["icon-"]) && (!this.hasClass(i, ["close"]) && (!this.hasClass(i, ["tip-layer"]) && (!this.hasClass(i, ["tip-input"]) && !this.hasClass(e, ["leaflet-popup", "total-popup-content"]))))
        }
    })
}();
var Geo = {
    repaintGeoJson: function (e) {
        if (e) {
            var s = e.options.id;
            this.mainLayer.removeLayer(e), this.deleteGeoJson(s), this.persistGeoJson(e, e.options.simple), this.plotGeoJsons(s)
        }
    }, getGeoJsons: function () {
        return sessionStorage.geos ? JSON.parse(sessionStorage.geos) : []
    }, getGeoJson: function (e) {
        var s = this.getGeoJsons();
        for (var o in s) if (s[o].properties.id === e) return s[o].index = parseInt(o), s[o];
        return null
    }, deleteGeoJson: function (e) {
        var s = this.getGeoJsons(), o = this.getGeoJson(e);
        o && (s.splice(o.index, 1), this.saveGeoJsons(s))
    }, purgeGeoJsons: function () {
        this.saveGeoJsons([])
    }, saveGeoJsons: function (e) {
        e = JSON.stringify(e), sessionStorage.geos = e, this._map.fire("shape_changed")
    }, updateGeoJson: function (e) {
        this.deleteGeoJson(e.properties.id), this.insertGeoJson(e)
    }, insertGeoJson: function (e) {
        var s = this.getGeoJsons();
        s.push(e), this.saveGeoJsons(s)
    }, persistGeoJson: function (e) {
        var s, o, t = [], i = e.options.id ? "update" : "insert", n = e.options.id || (new Date).getTime();
        e.options.id = n, this.poly && e.removeLayer(this.poly), e.eachLayer(function (e) {
            o = e.toGeoJSON(), o.properties.styles = e.options, t.push(o)
        }), s = {
            type: "FeatureCollection",
            properties: {
                id: n,
                hidden: !1,
                description: e.options.description,
                name: e.options.title,
                type: e.options.type,
                lastPoint: e.options.lastPoint
            },
            features: t
        }, this[i + "GeoJson"](s)
    }, plotGeoJsons: function (e) {
        var s = this;
        this.resetRuler();
        var o, t = this.getGeoJsons(), i = function (e, o) {
            var t;
            return t = e.properties.styles.label ? s.nodeFeature.renderLabel(o, e.properties.styles.label, e.properties.styles, !1) : s.nodeFeature.renderCircle(o, !1, !1, !1, !0, e.properties.styles)
        }, n = function (e) {
            return e.properties.styles
        }, r = function (e) {
            e.getLatLngs && (multi = e)
        };
        for (var p in t) e && e !== t[p].properties.id || t[p].properties.hidden || (props = t[p].properties, o = L.geoJson(t[p], {
            id: props.id,
            pointToLayer: i,
            style: n,
            hidden: props.hidden,
            description: props.description,
            title: props.name,
            lastPoint: props.lastPoint,
            type: props.type
        }).addTo(this.mainLayer), o.eachLayer(r), props.lastPoint && this.labelFeature.drawTooltip(props.lastPoint, o, props.name))
    }
};
!function () {
    L.Class.LabelFeature = L.Class.Feature.extend({
        options: {name: "label"}, initialize: function (t, e) {
            L.Class.Feature.prototype.initialize.call(this, t), this.enableFeature(), this.map = e
        }, onClick: function (t, e) {
            e && this.onDblClick(t)
        }, onDblClick: function (t) {
            var e = this.core.layer, i = e.options.title, l = !1;
            e.eachLayer(function (t) {
                l = !0
            }), l && this.drawTooltip(t.latlng, e, i)
        }, drawTooltip: function (t, e, i) {
            e.options.lastPoint = t;
            var l = this.core.options.color, o = this.getIconHtml(i, l);
            e.totalIcon = L.divIcon({className: "total-popup", html: o}), e.total = L.marker(t, {
                icon: e.totalIcon,
                clickable: !0,
                total: !0,
                type: "label"
            }).addTo(e), this.drawTooltipHandlers({latlng: t}, e, i)
        }, getIconHtml: function (t, e) {
            var i = "#fff" === e ? "black" : "#fff",
                l = ['<div class="total-popup-content" style="background-color:' + e + "; color: " + i + ';">', '  <input class="tip-input hidden-el" type="text" style="color: ' + i + '" />', '  <div class="tip-layer">' + t + "</div>", '  <svg class="close" viewbox="0 0 45 35">', '   <path class="close" style="stroke:' + i + '" d="M 10,10 L 30,30 M 30,10 L 10,30" />', "  </svg>", "</div>"].join("");
            return l
        }, drawTooltipHandlers: function (t, e, i) {
            var l = this, o = e, n = i ? i : "Untitled", a = "ruler" === e.options.type,
                s = (this.core._map, e.options.title.split(" ")), r = {scalar: s[0], unit: s[1]};
            this.SUB_UNIT_CONV = 1e3, "imperial" === this.options.unitSystem && (this.SUB_UNIT_CONV = 5280);
            var c = {
                latlng: t.latlng,
                total: r,
                total_label: e.total,
                sub_unit: this.SUB_UNIT_CONV,
                workspace: o,
                rulerOn: a
            }, d = function (t) {
                var e = (new Date).getTime(), i = e - o.tik;
                return o.tik = e, i < 300
            }, p = function (t) {
                var e = l.map;
                L.DomEvent.stop(t), d(t) && u(), t.originalEvent && L.DomUtil.hasClass(t.originalEvent.target, "close") && (e.fire("shape_delete", {id: o.options.id}), e.fire("shape_changed"))
            }, u = function (t) {
                if (l.core.selectedLayer = o, a) return void o.fireEvent("selected", c);
                var i, s = (l.map, e), r = "", d = e.total._icon.children[0], p = d.children, u = function (t) {
                    L.DomUtil.addClass(i, "hidden-el"), L.DomUtil.removeClass(r, "hidden-el"), e.options.title = i.value, l.core.persistGeoJson(e), i.removeEventListener("blur", u), i.removeEventListener("keyup", h)
                }, h = function (t) {
                    var e = i.value;
                    r.innerHTML = e || "&nbsp;", s.title = e || "", n = e || "", "Enter" === t.key ? u() : (r.innerHTML = i.value || "&nbsp;", f = r.offsetWidth, i.style.width = f + "px")
                };
                for (var v in p) {
                    if (!p[v].nodeName) break;
                    L.DomUtil.hasClass(p[v], "tip-layer") ? (r = p[v], L.DomUtil.addClass(r, "hidden-el")) : L.DomUtil.hasClass(p[v], "tip-input") && (i = p[v], i.value = n, L.DomUtil.removeClass(i, "hidden-el"), i.addEventListener("keyup", h), i.addEventListener("blur", u), i.focus())
                }
                var f = r.offsetWidth;
                i.style.width = f + "px"
            };
            this.core.persistGeoJson(e), o.off("click"), o.on("click", p), o.on("selected", this.core.onSelect), o.is_new && u()
        }
    })
}();
!function () {
    L.Class.NapFeature = L.Class.Feature.extend({
        options: {name: "nap"}, initialize: function (e) {
            L.Class.Feature.prototype.initialize.call(this, e), this.enableFeature();
            var n = this;
            setTimeout(function () {
                n.reorderFeatures("nap", e)
            }, 1e3)
        }, onClick: function (e) {
            this.checkSorroundings(e)
        }, onMove: function (e) {
            this.checkSorroundings(e)
        }, checkSorroundings: function (e) {
            var n = this, t = this.core.mainLayer;
            t.eachLayer(function (t) {
                n.checkLayer(t, e)
            })
        }, checkLayer: function (e, n) {
            e.eachLayer(function (e) {
                if ("node" === e.options.type && e.getLatLng().equals(n.latlng, .003)) return n.latlng = e.getLatLng(), !0
            })
        }
    })
}();
!function () {
    L.Class.DragFeature = L.Class.ControlFeature.extend({
        options: {name: "drag"},
        dx: 0,
        dy: 0,
        initialize: function (e) {
            L.Class.ControlFeature.prototype.initialize.call(this, e);
            var t = this;
            setTimeout(function () {
                t.reorderFeatures("drag", e)
            }, 1e3)
        },
        enableFeature: function () {
            L.Class.ControlFeature.prototype.enableFeature.call(this), this.core._map.dragging.disable(), this.core.napFeature && this.core.napFeature.disableFeature(), this.initialPreparation()
        },
        disableFeature: function () {
            L.Class.ControlFeature.prototype.disableFeature.call(this), this.core._map.dragging.enable(), this.core.napFeature && this.core.napFeature.enableFeature(), this.cleanup()
        },
        onClick: function (e) {
            if (L.DomUtil.hasClass(e.originalEvent.target, "icon-drag")) return !1
        },
        initialPreparation: function () {
            var e = this, t = this.core._map, n = function (t, n, o) {
                var a = function (t) {
                    e.selectedLayer = o
                };
                "line" !== t.options.type && "polygon" !== t.options.type || (t.fn = a, t.on("mousedown", a, e))
            };
            this.checkSorroundings({}, n), t.on("mousedown", this.mapStartDrag, this), t.on("mousemove", this.mapDrag, this), t.on("mouseout", this.mapStopDrag, this), t.on("mouseup", this.mapStopDrag, this)
        },
        cleanup: function () {
            var e = this, t = this.core._map, n = function (t, n, o) {
                "line" !== t.options.type && "polygon" !== t.options.type || t.off("mousedown", t.fn, e)
            };
            this.checkSorroundings({}, n), t.off("mousedown", this.mapStartDrag, this), t.off("mousemove", this.mapDrag, this), t.off("mouseout", this.mapDrag, this), t.off("mouseup", this.mapDrag, this)
        },
        mapStartDrag: function (e) {
            var t = this;
            this.startDragging(e), this.selectedLayer || this.selectedNode || "path" === e.originalEvent.target.nodeName || (t.mapDragging = !0)
        },
        mapDrag: function (e) {
            var t, n = this, o = 7, a = n.core._map;
            n.mapDragging ? (t = a.latLngToContainerPoint(a.getCenter()), t.x -= e.originalEvent.movementX * o, t.y -= e.originalEvent.movementY * o, a.setView(a.containerPointToLatLng(t))) : (this.selectedLayer || this.selectedNode) && this.dragLayer(e)
        },
        mapStopDrag: function (e) {
            this.stopDragging(), this.mapDragging = !1
        },
        startDragging: function (e) {
            var t, n = this, o = function (e, o, a) {
                if ("node" === e.options.type) {
                    if (e.getLatLng().equals(o.latlng, .003)) return void(n.selectedNode = e)
                } else if (e.getLatLngs) {
                    t = e.getLatLngs(), "polygon" === e.options.type && (t = t[0]);
                    var i, r, s = n.getSegments(t), l = n.core._map.latLngToContainerPoint(o.latlng);
                    for (var g in s) if (i = L.LineUtil.closestPointOnSegment(l, s[g][0], s[g][1]), r = n.core._map.containerPointToLatLng(i), r.equals(o.latlng, .003)) return void(n.selectedLayer = a)
                }
            };
            this.checkSorroundings(e, o)
        },
        getSegments: function (e) {
            var t, n, o = [];
            for (var a in e) n = this.core._map.latLngToContainerPoint(e[a]), t && o.push([t, n]), t = n;
            return o
        },
        stopDragging: function (e) {
            this.selectedNode = null, this.selectedLayer = null, this.core._map.off("mousemove", this.dragLayer, this), this.core._map.off("mouseup", this.stopDragging, this)
        },
        dragLayer: function (e) {
            var t = this;
            if (this.dx = e.originalEvent.movementX, this.dy = e.originalEvent.movementY, this.selectedNode && "node" === this.selectedNode.options.type) {
                var n = this.selectedNode.getLatLng();
                this.selectedNode.setLatLng(e.latlng), this.findNodeLines(n, e.latlng)
            } else if (this.selectedLayer) {
                var t = this, o = (new L.Transformation(this.dx, 1, this.dy, 1), this.selectedLayer);
                o.eachLayer(function (e) {
                    if ("line" === e.options.type || "polygon" === e.options.type) {
                        var n, o = e.getLatLngs();
                        "polygon" === e.options.type && (o = o[0]);
                        for (var a in o) n = t.core._map.latLngToContainerPoint(o[a]), n.x += t.dx, n.y += t.dy, o[a] = t.core._map.containerPointToLatLng(n);
                        e.setLatLngs(o)
                    } else e.getLatLng && (n = t.core._map.latLngToContainerPoint(e.getLatLng()), n.x += t.dx, n.y += t.dy, e.setLatLng(t.core._map.containerPointToLatLng(n)))
                })
            }
        },
        findNodeLines: function (e, t) {
            var n = this, o = function (e, o, a) {
                var i, r = [];
                if ("line" === e.options.type || "polygon" === e.options.type) {
                    r = e.getLatLngs(), "polygon" === e.options.type && (r = r[0]);
                    for (var s in r) if (r[s].equals(o)) {
                        r[s].lat = t.lat, r[s].lng = t.lng;
                        break
                    }
                    e.setLatLngs(r), "ruler" === e.options.stype ? (n.core.rulerFeature.layer = a, n.core.rulerFeature.latlngs = r, n.core.rulerFeature.clearAll(a), n.core.rulerFeature.drawRulerLines(a, null), n.core.rulerFeature.layer = null, n.core.rulerFeature.latlngs = null) : n.core.lineFeature.clearAll(a), i = r[r.length - 1], n.core.labelFeature.drawTooltip(i, a, a.options.title)
                }
            };
            this.checkSorroundings(e, o)
        },
        checkSorroundings: function (e, t) {
            var n = this, o = this.core.mainLayer;
            o && o.eachLayer(function (o) {
                n.checkLayerGroup(o, e, t)
            })
        },
        checkLayerGroup: function (e, t, n) {
            e.eachLayer(function (o) {
                n && n(o, t, e)
            })
        }
    })
}();
!function () {
    L.Class.NodeFeature = L.Class.ControlFeature.extend({
        options: {name: "node"}, onClick: function (t) {
            var o = L.Class.ControlFeature.prototype.onClick.call(this, t);
            if (o) {
                if (L.DomUtil.hasClass(t.originalEvent.target, "icon-node")) return !1;
                this.renderCircle(t.latlng, this.core.layer, "node", "", !0)
            }
            return o
        }, renderCircle: function (t, o, e, l, i, r) {
            var a = this.options.color, n = this.core.options, c = 3;
            e = e || "circle", "node" != e && (c = 1, a = "blue", "dot" === e && (a = "white"));
            var n = r || {
                color: a,
                opacity: n.opacity,
                fillOpacity: n.fillOpacity,
                weight: n.weight,
                fill: n.fill,
                fillColor: n.fillColor,
                type: e
            }, s = L.circleMarker(t, n);
            return s.setRadius(c), o && s.addTo(o), i || this.renderLabel(t, l, n, o), s
        }, renderLabel: function (t, o, e, l) {
            var i, r = e.type, a = this.options.color, n = this.core._map.latLngToContainerPoint(t);
            if (p_latLng = this.core._map.containerPointToLatLng(n), "dot" === e.type && (a = "blue"), o) {
                var c = L.divIcon({
                    className: "dot" === e.type ? "total-popup-label-dot" : "total-popup-label",
                    html: this.getIconLabelHtml(o, a)
                });
                i = L.marker(p_latLng, {icon: c, type: r, label: o}), e.label = o, l && i.addTo(l)
            }
            return i
        }
    })
}();
!function () {
    L.Class.LineFeature = L.Class.NodeFeature.extend({
        options: {name: "line", doubleClickSpeed: 300},
        latlngs: [],
        onClick: function (o) {
            var l = L.Class.NodeFeature.prototype.onClick.call(this, o);
            if (l) {
                if (L.DomUtil.hasClass(o.originalEvent.target, "icon-line")) return !1;
                this.latlngs.push(o.latlng)
            }
            return l
        },
        onMove: function (o, l) {
            if (this.latlngs.length) {
                var t = (this.core, this.latlngs.concat([o.latlng]));
                this.poly ? this.poly.setLatLngs(t) : "polygon" === this.options.name ? this.poly = this.renderPolygon(t, l) : this.poly = this.renderPolyline(t, l)
            }
        },
        onDblClick: function (o) {
            this.poly = null, this.latlngs.length = 0
        },
        renderPolyline: function (o, l) {
            var t = this.core.options, i = L.polyline(o, {
                color: t.color,
                fill: "polygon" === l.options.type ? t.fill : "",
                fillColor: t.fillColor,
                stroke: t.stroke,
                opacity: t.opacity,
                fillOpacity: t.fillOpacity,
                weight: t.weight,
                dashArray: t.dashArray,
                type: "line"
            });
            return i.addTo(l), i
        },
        renderPolygon: function (o, l) {
            var t = this.core.options, i = L.polygon(o, {
                color: t.color,
                fill: "polygon" === l.options.type ? t.fill : "",
                fillColor: t.fillColor,
                stroke: t.stroke,
                opacity: t.opacity,
                fillOpacity: t.fillOpacity,
                weight: t.weight,
                dashArray: t.dashArray,
                type: "polygon"
            });
            return i.addTo(l), i
        },
        clearAll: function (o) {
            o && o.eachLayer(function (l) {
                (l.options && "tmp" === l.options.type || "fixed" === l.options.type || "label" === l.options.type) && o.removeLayer(l)
            })
        }
    })
}();
!function () {
    L.Class.PolyFeature = L.Class.LineFeature.extend({
        options: {name: "polygon"}, onClick: function (n) {
            return !L.DomUtil.hasClass(n.originalEvent.target, "icon-polygon") && L.Class.LineFeature.prototype.onClick.call(this, n)
        }
    })
}();
!function () {
    L.Class.RulerFeature = L.Class.LineFeature.extend({
        options: {name: "ruler"}, initialize: function (t) {
            L.Class.LineFeature.prototype.initialize.call(this, t), this.resetRuler()
        }, enableFeature: function () {
            L.Class.LineFeature.prototype.enableFeature.call(this), this.core.napFeature && this.core.napFeature.disableFeature()
        }, disableFeature: function () {
            L.Class.LineFeature.prototype.disableFeature.call(this), this.core.napFeature && this.core.napFeature.enableFeature()
        }, onClick: function (t) {
            L.DomUtil.hasClass(t.originalEvent.target, "icon-ruler") || L.Class.LineFeature.prototype.onClick.call(this, t)
        }, onMove: function (t, e) {
            L.Class.LineFeature.prototype.onMove.call(this, t, e), this.poly && (this.poly.options.stype = "ruler"), this.drawRulerLines(e, t)
        }, onDblClick: function (t) {
            this.fixMeasurements(this.core.layer);
            this.latlngs;
            this.core.layer.options.title = this.measure.scalar + " " + this.measure.unit, L.Class.LineFeature.prototype.onDblClick.call(this, t)
        }, drawRulerLines: function (t, e) {
            if (this.latlngs.length) {
                var i, n = e ? this.latlngs.concat([e.latlng]) : this.latlngs, s = 0, a = 0, o = !1;
                if (s = this.getStaticSum(n), this.cleanUpTmp(t), n.length > 1) for (var r in n) o = n[r].equals(n[n.length - 1]), i && (a += this.displayMarkers.apply(this, [[i, n[r]], !0, a, t, s, o])), i = n[r]
            }
        }, displayMarkers: function (t, e, i, n, s, a) {
            var o, r, l, h, u, p, c, f = t[1], y = t[0], m = y.distanceTo(f) / this.UNIT_CONV, U = m,
                C = n.measure || this.measure, N = this.core._map.latLngToContainerPoint(f),
                T = this.core._map.latLngToContainerPoint(y), d = 1, g = s, F = !0;
            s > 1 ? (C.unit = this.UNIT, F = !1) : (F = !0, C.unit = this.SUB_UNIT, g = this.SUB_UNIT_CONV * s), c = this.getSeparation(g, F), C.scalar = g.toFixed(2), C.unit === this.SUB_UNIT && (d = this.SUB_UNIT_CONV, U *= d);
            for (var _ = i * d + U, I = i * d, S = C.unit, v = Math.floor(I); v < _; v++) h = (_ - v) / U, v % c || v < I || (o = N.x - h * (N.x - T.x), r = N.y - h * (N.y - T.y), u = L.point(o, r), p = this.core._map.containerPointToLatLng(u), l = v + " " + S, v && this.renderCircle(p, n, "tmp", l, !1, !1), this.last = _);
            if (!a) {
                var x = (I + m).toFixed(2) + " " + S;
                this.renderCircle(f, n, "dot", x, !1, !1)
            }
            return m
        }, getSeparation: function (t, e) {
            var i = (parseInt(t) + "").length, n = Math.pow(10, i), s = 5, a = n / 10;
            return e && (s = 2), 5 * a > t && (a = parseInt(a / s)), a
        }, getStaticSum: function (t) {
            var e = 0;
            if (t.length) if (t[0].length) for (var i in t) e += this.countLine(t[i]); else e = this.countLine(t); else e = this.sum;
            return e
        }, countLine: function (t) {
            var e, i, n = 0;
            for (var s in t) e = t[s], i && (n += i.distanceTo(e) / this.UNIT_CONV), i = t[s];
            return n
        }, resetRuler: function () {
            this.sum = 0, this.distance = 0, this.separation = 1, this.last = 0, this.fixedLast = 0, this.totalIcon = null, this.total = null, this.lastCircle = null, this.UNIT_CONV = 1e3, this.SUB_UNIT_CONV = 1e3, this.UNIT = "km", this.SUB_UNIT = "m", "imperial" === this.options.unitSystem && (this.UNIT_CONV = 1609.344, this.SUB_UNIT_CONV = 5280, this.UNIT = "mi", this.SUB_UNIT = "ft"), this.measure = {
                scalar: 0,
                unit: this.SUB_UNIT
            }
        }, clearAll: function (t) {
            t && t.eachLayer(function (e) {
                !e.options || "dot" !== e.options.type && "tmp" !== e.options.type && "fixed" !== e.options.type && "label" !== e.options.type || t.removeLayer(e)
            })
        }, cleanUpTmp: function (t) {
            t && t.eachLayer(function (e) {
                !e.options || "dot" !== e.options.type && "tmp" !== e.options.type || t.removeLayer(e)
            })
        }, fixMeasurements: function (t) {
            t && t.eachLayer(function (t) {
                "tmp" === t.options.type && (t.options.type = "fixed")
            })
        }
    })
}();
!function () {
    L.Class.StyleFeature = L.Class.ControlFeature.extend({
        options: {
            name: "style",
            pallette: ["#FF0080", "#4D90FE", "red", "blue", "green", "orange", "black"],
            dashArrayOptions: ["5, 5", "5, 10", "10, 5", "5, 1", "1, 5", "0.9", "15, 10, 5", "15, 10, 5, 10", "15, 10, 5, 10, 15", "5, 5, 1, 5"]
        }, enableFeature: function () {
            L.Class.ControlFeature.prototype.enableFeature.call(this), this.buildPaintPane()
        }, disableFeature: function () {
            L.Class.ControlFeature.prototype.disableFeature.call(this), this.disablePaint()
        }, enablePaint: function () {
            this.paintPane ? L.DomUtil.removeClass(this.paintPane, "hidden-el") : this.buildPaintPane()
        }, disablePaint: function () {
            this.paintPane && L.DomUtil.addClass(this.paintPane, "hidden-el")
        }, onPaintChange: function (t) {
            this.affectSelectedLayer(t)
        }, affectSelectedLayer: function (t) {
            var e = this, i = {};
            i[t] = e.core.options[t], this.core.selectedLayer && (this.core.selectedLayer.eachLayer(function (n) {
                if (n.setStyle) n.setStyle(i); else {
                    var a = n.options.icon, o = i[t], s = "";
                    if (n.options.total && "color" === t) {
                        s = e.core.selectedLayer.title;
                        var l = e.getIconHtml(s, o);
                        L.setOptions(a, {html: l}), n.setIcon(a)
                    } else if ("fixed" === n.options.type && "color" === t) {
                        s = n.options.label;
                        var l = e.getIconLabelHtml(s, o);
                        L.setOptions(a, {html: l}), n.setIcon(a)
                    }
                }
            }), this.core.persistGeoJson(this.core.selectedLayer, this.core.selectedLayer.options.simple))
        }, getIconHtml: function (t, e) {
            var i = "#fff" === e ? "black" : "#fff",
                n = ['<div class="total-popup-content" style="background-color:' + e + "; color: " + i + ';">', '  <input class="tip-input hidden-el" type="text" style="color: ' + i + '" />', '  <div class="tip-layer">' + t + "</div>", '  <svg class="close" viewbox="0 0 45 35">', '   <path class="close" style="stroke:' + i + '" d="M 10,10 L 30,30 M 30,10 L 10,30" />', "  </svg>", "</div>"].join("");
            return n
        }, idealTextColor: function (t) {
            var e = 105, i = this.getRGBComponents(t), n = .299 * i.R + .587 * i.G + .114 * i.B;
            return 255 - n < e ? "#000000" : "#ffffff"
        }, getRGBComponents: function (t) {
            var e = t.substring(1, 3), i = t.substring(3, 5), n = t.substring(5, 7);
            return {R: parseInt(e, 16), G: parseInt(i, 16), B: parseInt(n, 16)}
        }, buildPaintPane: function () {
            var t = this, e = this.core._map.getContainer();
            this.paintPane = L.DomUtil.create("div", "paint-pane", e);
            var i = new L.Draggable(this.paintPane);
            i.enable(), this.buildPaneHeader(), this.buildPaneSection("color", function () {
                t.paintColor.addEventListener("click", function (e) {
                    if (L.DomEvent.stop(e), L.DomUtil.hasClass(e.target, "clickable")) {
                        var i = "SPAN" === e.target.nodeName ? e.target.parentElement : e.target,
                            n = i.getAttribute("color"), a = i.parentElement, o = a.childNodes;
                        for (var s in o) t.isElement(o[s]) && L.DomUtil.removeClass(o[s], "paint-color-selected");
                        L.DomUtil.addClass(i, "paint-color-selected"), t.core.options.color = n, t.onPaintChange("color")
                    }
                })
            }), this.buildPaneSection("fillColor", function () {
                t.paintFillColor.addEventListener("click", function (e) {
                    if (L.DomEvent.stop(e), L.DomUtil.hasClass(e.target, "clickable")) {
                        var i = "SPAN" === e.target.nodeName ? e.target.parentElement : e.target,
                            n = i.getAttribute("color"), a = i.parentElement, o = a.childNodes;
                        for (var s in o) t.isElement(o[s]) && L.DomUtil.removeClass(o[s], "paint-color-selected");
                        L.DomUtil.addClass(i, "paint-color-selected"), t.core.options.fillColor = n, t.onPaintChange("fillColor")
                    }
                })
            }), this.buildPaneSection("flags", function () {
                t.paintFlags.addEventListener("click", function (e) {
                    L.DomUtil.hasClass(e.target, "clickable") && "INPUT" === e.target.nodeName && (e.target.checked ? (t.core.options[e.target.getAttribute("flag")] = !0, t.onPaintChange(e.target.getAttribute("flag"))) : (t.core.options[e.target.getAttribute("flag")] = !1, t.onPaintChange(e.target.getAttribute("flag"))))
                })
            }), this.buildPaneSection("dashArray", function () {
                t.paintDashArray.addEventListener("click", function (e) {
                    if (L.DomEvent.stop(e), L.DomUtil.hasClass(e.target, "clickable")) {
                        var i = "svg" === e.target.nodeName ? e.target : e.target.parentElement, n = i.childNodes,
                            a = Math.round((e.offsetY - 10) / 20);
                        for (var o in n) (t.isElement(n[o]) || n[o].nodeName) && L.DomUtil.removeClass(n[o], "line-selected");
                        var s = n[a];
                        s && (L.DomUtil.addClass(n[a], "line-selected"), t.core.options.dashArray = n[a].getAttribute("stroke-dasharray").replace(/,/g, ""), t.onPaintChange("dashArray"))
                    }
                })
            }), this.buildPaneSection("opacity", function () {
                t.paintOpacity.addEventListener("mousedown", function (e) {
                    L.DomEvent.stop(e), t.slidemove = !0
                }), t.paintOpacity.addEventListener("mousemove", function (e) {
                    L.DomEvent.stop(e), t.slidemove && t.moveSlider(e)
                }), t.paintOpacity.addEventListener("mouseup", function (e) {
                    t.slidemove = !1, L.DomEvent.stop(e), t.moveSlider(e)
                }), t.paintOpacity.addEventListener("click", function (e) {
                    L.DomEvent.stop(e), t.moveSlider(e)
                })
            })
        }, moveSlider: function (t) {
            var e = this;
            if (L.DomUtil.hasClass(t.target, "clickable") && "INPUT" === t.target.nodeName) {
                var i = t.offsetX / t.target.clientWidth;
                "1" == t.target.getAttribute("step") && (i *= 10), t.target.value = i, e.core.options[t.target.getAttribute("flag")] = t.target.value, e.onPaintChange(t.target.getAttribute("flag"))
            }
        }, buildPaneHeader: function () {
            var t = this, e = ['<span>Styling Options</span><i class="close">x</i>'].join("");
            this.paintPaneHeader = L.DomUtil.create("div", "paint-pane-header", this.paintPane), this.paintPaneHeader.innerHTML = e, this.paintPaneHeader.addEventListener("click", function (e) {
                L.DomEvent.stop(e), "I" === e.target.nodeName && t.disableFeature()
            })
        }, buildPaneSection: function (t, e) {
            var i = this.capString(t), n = this["build" + i + "Section"]();
            this["paint" + i] = L.DomUtil.create("div", "paint-pane-section paint-pane-" + t, this.paintPane), this["paint" + i].innerHTML = n, e && "function" == typeof e && e()
        }, buildColorSection: function () {
            var t = this.core.options.pallette, e = "", i = [];
            for (var n in t) e = t[n] === this.core.options.color ? "paint-color-selected" : "", i.push('<li class="paint-color clickable ' + e + '" color="' + t[n] + '"><span class="clickable" style="background-color: ' + t[n] + ';"></span></li>');
            var a = ['<span class="section-header">Stroke</span>', '<ul class="section-body paint-color-wrapper">', i.join(""), "</ul>"].join("");
            return a
        }, buildFillColorSection: function () {
            var t = this.core.options.pallette, e = "", i = [];
            for (var n in t) e = t[n] === this.core.options.fillColor ? "paint-color-selected" : "", i.push('<li class="paint-color clickable ' + e + '" color="' + t[n] + '"><span class="clickable" style="background-color: ' + t[n] + ';"></span></li>');
            var a = ['<span class="section-header">Fill Color</span>', '<ul class="section-body paint-color-wrapper">', i.join(""), "</ul>"].join("");
            return a
        }, buildFlagsSection: function () {
            var t = ["stroke", "fill"], e = "", i = [];
            for (var n in t) e = this.core.options[t[n]] ? "checked" : "", i.push('<div><input value="' + t[n] + '" type="checkbox" ' + e + ' class="clickable" flag="' + t[n] + '"> Draw ' + t[n] + "</div>");
            var a = ['<span class="section-header">Options</span>', '<div class="section-body">', i.join(""), "</div>"].join("");
            return a
        }, buildDashArraySection: function () {
            var t = this.core.options.dashArrayOptions, e = "", i = [], n = 10;
            for (var a in t) e = this.core.options.dashArray === t[a] ? "line-selected" : "", i.push('<line class="clickable pain-lines ' + e + '" stroke-dasharray="' + t[a] + '" x1="10" y1="' + n + '" x2="160" y2="' + n + '" />'), n += 20;
            var o = ['<span class="section-header">Dash Array</span>', '<svg class="section-body clickable" width="170" height="200" viewPort="0 0 200 160" version="1.1" xmlns="http://www.w3.org/2000/svg">', i.join(""), "</svg>"].join("");
            return o
        }, buildOpacitySection: function () {
            var t = ["opacity", "fillOpacity", "weight"], e = [], i = 0, n = 0;
            for (var a in t) "weight" === t[a] ? (i = 10, n = 1) : (i = 1, n = .1), e.push('<span class="section-header">' + this.capString(t[a]) + "</span>"), e.push('<div class="section-body">'), e.push(' <div><input value="' + this.core.options[t[a]] + '" type="range" min="0" max="' + i + '" step="' + n + '" class="clickable" flag="' + t[a] + '"></div>'), e.push("</div>");
            return e.join("")
        }, isElement: function (t) {
            try {
                return t instanceof HTMLElement
            } catch (e) {
                return "object" == typeof t && 1 === t.nodeType && "object" == typeof t.style && "object" == typeof t.ownerDocument
            }
        }
    })
}();
!function () {
    L.Class.TrashFeature = L.Class.ControlFeature.extend({
        options: {name: "trash"}, onClick: function (e) {
            var r = this;
            this.core.mainLayer.eachLayer(function (e) {
                r.core.mainLayer.removeLayer(e)
            }), this.core.purgeGeoJsons(), this.core._map.fire("shape_changed"), r.core.resetRuler(), setTimeout(function () {
                r.disableFeature()
            }, 100)
        }
    })
}();
var Handlers = {
    onDblClick: function (i, t, e) {
        var n, s = this;
        for (var r in this.featureList) n = this.featureList[r], n.isEnabled() && n.onDblClick(i);
        s.reset(i)
    }, getMouseClickHandler: function (i) {
        var t = !1;
        if (this.layer || this.initLayer(), this.isDblClick()) this.onDblClick(i); else {
            var e;
            for (var n in this.featureList) e = this.featureList[n], e.isEnabled() && ("node" === e.options.name && (t = !0), e.onClick(i, t))
        }
        t && this.reset(i)
    }, getMouseMoveHandler: function (i) {
        var t;
        for (var e in this.featureList) t = this.featureList[e], t.isEnabled() && t.onMove(i, this.layer)
    }, isDblClick: function () {
        var i = (new Date).getTime(), t = i - this.tik;
        return this.tik = i, t < this.options.doubleClickSpeed
    }, onAdded: function () {
    }, onSelect: function (i) {
    }
};
!function () {
    var mixins = [Utils, Geo, Handlers];
    L.Control.LinearCore = L.Control.extend({
        options: {
            position: "topleft",
            color: "#4D90FE",
            fillColor: "#fff",
            features: ["node", "line", "poly", "ruler", "nap", "label", "style", "drag", "trash"],
            pallette: ["#FF0080", "#4D90FE", "red", "blue", "green", "orange", "black"],
            dashArrayOptions: ["5, 5", "5, 10", "10, 5", "5, 1", "1, 5", "0.9", "15, 10, 5", "15, 10, 5, 10", "15, 10, 5, 10, 15", "5, 5, 1, 5"],
            fill: !0,
            stroke: !0,
            dashArray: "5, 5",
            weight: 2,
            opacity: 1,
            fillOpacity: .5,
            radius: 3,
            unitSystem: "imperial",
            doubleClickSpeed: 300
        }, includes: mixins, tik: 0, onAdd: function (e) {
            var t = L.DomUtil.create("div", "leaflet-control leaflet-bar"), i = e.getContainer(), a = this, s = "draw";
            return this.options.features && 1 === this.options.features.length && (s = a.options.features[0]), this.link = L.DomUtil.create("a", "icon-" + s, t), this.link.href = "#", this.link.title = "", this.container = t, e.on("linear_feature_on", function (e) {
                a.active || (a.active = !0, a.initRuler(t), L.DomUtil.addClass(a.link, "icon-active"), L.DomUtil.addClass(i, "ruler-map"))
            }), L.DomEvent.on(a.link, "click", L.DomEvent.stop).on(a.link, "click", function () {
                L.DomUtil.hasClass(a.link, "icon-active") ? (a.active = !1, a.resetRuler(!0), L.DomUtil.removeClass(a.link, "icon-active"), L.DomUtil.removeClass(i, "ruler-map")) : (a.active = !0, a.initRuler(t), L.DomUtil.addClass(a.link, "icon-active"), L.DomUtil.addClass(i, "ruler-map"))
            }), this.setUpColor(), this.onAdded(), t
        }, onRemove: function (e) {
            this.resetRuler(!0)
        }, verifyFeatureName: function (e) {
            var t = ["node", "label", "nap", "line", "poly", "ruler", "style", "trash", "drag", "trash"];
            if (this.featureMap[e]) return !1;
            this.featureMap[e] = !0;
            for (var i in t) if (t[i] === e) return !0;
            return !1
        }, initRuler: function (container) {
            var me = this, map = this._map;
            this.featureMap = {}, this.features = [];
            for (var j in this.options.features) this.features.push(this.options.features[j]);
            this.featureList = [], this.originalFeaturesCount = this.features.length, 1 === this.originalFeaturesCount && (this.features.push("node"), this.features.push("label"));
            var f;
            for (var i in this.features) f = this.features[i], this.verifyFeatureName(f) ? (this[f + "Feature"] = eval("new L.Class." + this.capString(f) + "Feature(this, this._map)"), this.featureList.push(this[f + "Feature"])) : console.log("One or more feature is invalid: " + f);
            this.mainLayer = L.featureGroup(), this.mainLayer.addTo(this._map), map.touchZoom.disable(), map.doubleClickZoom.disable(), map.boxZoom.disable(), map.keyboard.disable(), map.tap && map.tap.disable(), this.dblClickEventFn = function (e) {
                L.DomEvent.stop(e)
            }, map.on("click", this.getMouseClickHandler, this), map.on("dblclick", this.dblClickEventFn, map), map.on("mousemove", this.getMouseMoveHandler, this), this.mainLayer.on("dblclick", this.dblClickEventFn, this.mainLayer), this.shapeInit(), this.plotGeoJsons()
        }, initLayer: function () {
            this.layer = L.geoJson(), this.layer.is_new = !0, this.layer.tik = 0, this.layer.options.type = this.options.type, this.layer.options.title = "Untitled", this.layer.options.description = "...", this.layer.addTo(this.mainLayer), this.layer.on("selected", this.onSelect)
        }, resetRuler: function (e) {
            var t = this._map;
            if (e) {
                t.off("click", this.clickEventFn, this), t.off("mousemove", this.moveEventFn, this), t.off("dblclick", this.dblClickEventFn, t), this.mainLayer.off("dblclick", this.dblClickEventFn, this.mainLayer), this.layer && t.removeLayer(this.layer), this.mainLayer && t.removeLayer(this.mainLayer), this.mainLayer = null, t.touchZoom.enable(), t.boxZoom.enable(), t.keyboard.enable(), t.tap && t.tap.enable();
                for (var i in this.featureList) this.featureList[i].destroy()
            }
            this.layer = null, this.originalLatLng = null, this.prevLatlng = null, this.poly = null, this.multi = null, this.latlngs = null, this.latlngsList = [], this.nodes = []
        }, reset: function (e) {
            this.layer && (this.layer.off("dblclick"), L.DomEvent.stop(e), this.layer.removeLayer(this.poly), this.resetRuler(!1))
        }, shapeInit: function () {
            var e = this, t = this._map;
            t.on("shape_toggle", function (t) {
                var i = t.id, a = e.getGeoJson(i), s = e.getLayerById(i);
                a.properties.hidden = t.hidden, e.updateGeoJson(a), s && t.hidden ? e.mainLayer.removeLayer(s) : t.hidden || e.plotGeoJsons(i)
            }), t.on("shape_delete", function (t) {
                var i = t.id, a = e.getLayerById(i);
                a && (e.mainLayer.removeLayer(a), e.deleteGeoJson(i))
            }), t.on("shape_focus", function (i) {
                var a = i.id, s = e.getLayerById(a);
                s && (e.selectedLayer = s, t.setView(s.getBounds().getCenter()))
            }), t.on("shape_update", function (t) {
                var i = t.id, a = e.getGeoJson(i), s = e.getLayerById(i);
                e.mainLayer.removeLayer(s), a.properties.hidden = t.hidden, a.properties.name = t.name, a.properties.description = t.description, e.updateGeoJson(a), t.hidden || e.plotGeoJsons(i)
            })
        }
    })
}();