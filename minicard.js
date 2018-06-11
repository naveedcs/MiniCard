;(function(){
	var APP_DIV = document.getElementById("minicard")
	var PRODUCT = MiniCard_ProductInfo
	if(!APP_DIV || !PRODUCT) return false
				
	var MiniCard = {
		amount_options: null,
		frequency_options: null,
		oninit: function(vnode) {
		
			this.amount_options = []
			for(key in PRODUCT.data) {
				this.amount_options.push(parseInt(key))
			}
			
			this.frequency_options = []
			for(key in PRODUCT.data[this.amount_options[0]].ids) {
				this.frequency_options.push(parseInt(key))
			}
			
			this.data.amount = this.amount_options[0]
			this.data.frequency = this.frequency_options[0]
			this.data.quantity = 1
			this.data.id = PRODUCT.data[this.data.amount].ids[this.data.frequency]
			
		},
		stringify: function(i) {
			var i = parseInt(i)
			switch (i) {
				case 0:
					return ["one time"]
					break
				case 1:
					return ["every month"]
					break
				case 2:
					return ["every 2 months"]
					break
				case 3:
					return ["every 3 months"]
					break
				case 4:
					return ["every 4 months"]
					break
				case 5:
					return ["every 5 months"]
					break
				case 6:
					return ["every 6 months"]
					break
			}
		},
		data: {
			id: null,
			amount: null,
			frequency: null,
			quantity: null
		},
		setID: function() {
			this.data.id = PRODUCT.data[this.data.amount].ids[this.data.frequency]
		},
		setAmount: function(amount) {
			this.data.amount = parseInt(amount)
			this.setID()
		},
		setFrequency: function(frequency) {
			this.data.frequency = parseInt(frequency)
			this.setID()
		},
		quantityUp: function(e) {
			e.preventDefault()
			this.data.quantity++
		},
		quantityDown: function(e) {
			e.preventDefault()
			if (this.data.quantity <= 1) {
				this.data.quantity = 1
			} else {
				this.data.quantity--
			}
		},
		getOldPrice: function() {
			var qty = this.data.quantity
			var reg = PRODUCT.data[this.data.amount].prices.reg
			var sle = PRODUCT.data[this.data.amount].prices.sale
			var frq = this.data.frequency
			if (frq > 0) {
				if (reg > 0) {
					return "$"+reg.toFixed(2).replace(".00","") // (reg*qty)
				} else {
					return "$"+sle.toFixed(2).replace(".00","") // (sle*qty)
				}
			} else {
				if (reg > 0) {
					return "$"+reg.toFixed(2).replace(".00","") // (reg*qty)
				} else {
					return ""
				}
			}
		},
		getNewPrice: function() {
			var number
			if(this.data.frequency === 0) {
				number = PRODUCT.data[this.data.amount].prices.sale * this.data.quantity
			} else {
				number = PRODUCT.data[this.data.amount].prices.sub * this.data.quantity
			}
			return "$"+number.toFixed(2).replace(".00","")
		},
		getSavings: function() {
			var qty = this.data.quantity
			var reg = PRODUCT.data[this.data.amount].prices.reg
			var frq = this.data.frequency
			var sle = PRODUCT.data[this.data.amount].prices.sale
			var sub = PRODUCT.data[this.data.amount].prices.sub
			if (frq > 0) {
				if (reg > 0) {
					return " & Save $"+(reg-sub).toFixed(2).replace(".00","") // (reg-sub)*qty
				} else {
					return " & Save $"+(sle-sub).toFixed(2).replace(".00","") // (sle-sub)*qty
				}
			} else {
				if (reg > 0) {
					return " & Save $"+(reg-sle).toFixed(2).replace(".00","") // (reg-sle)*qty
				} else {
					return ""
				}
			}
		},
		addToCart: function(e) {
			e.preventDefault()
			var post_body = {
				"product_id": this.data.id,
				"quantity": this.data.quantity
			}
			m.request({
				method: "POST",
				url: "/?wc-ajax=add_to_cart",
				data: post_body
			}).then(function(result){
				if(result.error) {
					e.target.submit()
				} else {
					this.confirm = true
				}
			}).catch(function(error){
				e.target.submit()
			})
		},
		confirm: false,
		viewCart: function(e) {
			e.preventDefault()
			document.location = "/cart"
		},
		resetForm: function(e) {
			e.preventDefault()
			this.oninit()
			this.confirm = false
		},
		view: function(vnode) {
			return m("form.cart",{
				action: "/cart",
				method: "POST",
				onsubmit: this.addToCart.bind(this)
			},this.confirm?m(".confirm",[
					m("h3", "Added to cart"),
					m("button",{onclick:this.viewCart.bind(this)},"Checkout Now"),
					m("button.alt",{onclick:this.resetForm.bind(this)},"Keep shopping")
				]):[
				this.amount_options.length>1?[
					m(".minicard-option",this.amount_options.map(function(amount){
						return m("label",{class:vnode.state.data.amount===amount?"selected":""},[
								m("input",{
									type:"radio",
									name:"amount",
									value:amount,
									checked:vnode.state.data.amount===amount,
									onchange:m.withAttr("value",vnode.state.setAmount.bind(vnode.state))
								}),
								m("span",PRODUCT.unit==="months"?amount+" months":"$"+amount)
							])
					}))
				]:m("input",{type:"hidden",name:"amount",value:this.amount_options[0]}),
				this.frequency_options.length>1?[
					m(".minicard-subsave",{class:"subspan-"+(this.frequency_options.length-1)},m("span","Subscribe & Save!")),
					m(".minicard-option.minicard-option-slim",this.frequency_options.map(function(frequency){
						return m("label",{class:vnode.state.data.frequency===frequency?"selected":""},[
								m("input",{
									type:"radio",
									name:"frequency",
									value:frequency,
									checked:vnode.state.data.frequency===frequency,
									onchange:m.withAttr("value",vnode.state.setFrequency.bind(vnode.state))
								}),
								m("span",vnode.state.stringify(frequency))
							])
					}))
				]:m("input",{type:"hidden",name:"frequency",value:this.frequency_options[0]}),
				m(".minicard-prices",[
					m("span.old-price",this.getOldPrice()),
					m("span.new-price",this.getNewPrice()),
				]),
				m(".minicard-quantity",[
					m("button.minus",{onclick:this.quantityDown.bind(this)},"-"),
					m("input",{
						readonly:true,
						name:"quantity",
						value:this.data.quantity
					}),
					m("button.plus",{onclick:this.quantityUp.bind(this)},"+")
				]),
				m("input",{type:"hidden",name:"add-to-cart",value:this.data.id}),
				m(".minicard-button",
					m("button",vnode.state.data.frequency===0?"Buy Now"+this.getSavings():"Subscribe"+this.getSavings())
				)
			])
		}
	}
	m.mount(APP_DIV,MiniCard)	
}(m));