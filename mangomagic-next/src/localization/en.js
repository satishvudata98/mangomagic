export const en = {
  meta: {
    defaultDescription:
      "Browse premium mango varieties, check delivery by pincode, and place smooth local orders with MangoMagic."
  },
  common: {
    saving: "Saving..."
  },
  app: {
    loading: "Loading MangoMagic..."
  },
  auth: {
    errors: {
      signInNotEnabled:
        "Google sign-in is not enabled in Firebase yet. In Firebase Console, open Authentication > Sign-in method, enable Google, and set a support email.",
      unauthorizedDomain:
        "This domain is not authorized in Firebase Auth. Add your app domain in Firebase Console > Authentication > Settings > Authorized domains.",
      defaultSignIn: "Unable to sign in with Google.",
      loginRequired: "Please sign in to continue.",
      sessionExpired: "Your session expired. Please sign in again.",
      loadProfile: "Unable to load your profile.",
      saveProfile: "Unable to save your profile."
    }
  },
  components: {
    protectedRoute: {
      loading: "Checking your session..."
    },
    quantitySelector: {
      selectedLabel: "Selected",
      decreaseAria: "Decrease weight by 1 kilogram",
      increaseAria: "Increase weight by 1 kilogram"
    },
    cartItem: {
      sectionLabel: "Mango selection",
      pricePerKg: (price) => `${price} per kg`,
      itemTotal: "Item total",
      removeAria: (name) => `Remove ${name}`
    },
    productCard: {
      outOfStock: "Out of stock",
      inCart: (weight) => `${weight} kg in cart`,
      priceLabel: "Price",
      perKg: "per kg",
      referenceBox: "for the 5 kg reference box",
      selectWeight: "Select weight",
      selectWeightHelp: "Choose the quantity you want today and add it in one tap.",
      current: "Current",
      addAria: ({ weight, name }) => `Add ${weight} kilograms of ${name}`,
      addToBox: (weight) => `Add ${weight} kg to box`,
      addedToBox: (weight) => `${weight} kg added`
    },
    navbar: {
      home: "Home",
      contact: "Contact",
      orders: "Orders",
      cart: "Cart",
      signIn: "Sign in",
      logout: "Logout",
      brandTagline: "Premium mango ordering",
      compactDeliveryTitle: (location) => `Delivery confirmed for ${location}`,
      compactDeliveryBody: (pincode) => `Using pincode ${pincode}. You can change it any time before checkout.`,
      changePincode: "Change pincode",
      pincodeEyebrow: "Check delivery to your area",
      pincodePrompt:
        "Check if we deliver our farm-fresh mangoes to your door to guarantee maximum freshness.",
      pincodePlaceholder: "Enter 6-digit pincode",
      clearPincodeAria: "Clear pincode",
      checking: "Checking...",
      deliveringTo: (location) => `Delivering to ${location}`,
      notServiceable: "Not serviceable yet",
      savedPincode: (pincode) => `Saved pincode ${pincode}`,
      optionalBrowsing: "Pincode optional for browsing",
      floatingSignIn: "Sign in",
      mobileSelected: (weight) => `${weight} kg selected`
    },
    cartDrawer: {
      closeAria: "Close cart drawer",
      eyebrow: "Your box",
      title: "Your curated mango box",
      subtitle: "Adjust weights, keep browsing, and head to checkout only when you are ready.",
      cartTotal: "Cart total",
      synced: "Saved securely to your account.",
      selected: "Selected",
      perkUnlock: (remainingWeightKg, title) => `Add ${remainingWeightKg} more kg to unlock ${title}.`,
      allPerks: "Every premium cart perk is unlocked for this box.",
      highestTier: "Your box has unlocked our highest tier of premium packaging.",
      deliveryReady: (location) => `Delivery ready for ${location}.`,
      pincodeUnavailable: "This pincode is not serviceable yet.",
      useHeaderPincode: "Use the header pincode bar to check delivery before checkout.",
      currentPincode: (pincode) => `Current pincode: ${pincode}`,
      guestBrowsing: "You can still browse and build your cart as a guest.",
      emptyTitle: "Your mango box is empty",
      emptyBody: "Start with any variety, pick your kilos, and this drawer will stay ready while you browse.",
      varietiesSelected: (count) => `${count} varieties selected`,
      noItemsYet: "No items yet",
      clearCart: "Clear cart",
      addMangoes: "Add mangoes to continue",
      signInCheckout: "Sign in to checkout",
      secureCheckout: "Continue to secure checkout",
      addDeliveryDetails: "Add delivery details at checkout"
    }
  },
  pages: {
    products: {
      metaTitle: "Browse Mangoes",
      metaDescription:
        "Explore premium mango varieties, build your perfect box, and arrange fresh local delivery with MangoMagic.",
      loadError: "Unable to load today's mango selection.",
      hero: {
        eyebrow: "Orchard harvest",
        title: "Experience the finest hand-picked mangoes, delivered straight from the orchards to your door.",
        subtitle:
          "Build your perfect box of premium mangoes. Only the highest quality fruit makes it to our selection.",
        tagFarmToDoor: "Farm-to-Door Delivery",
        tagVarieties: (count) => `${count} premium varieties live`,
        tagOrganic: "100% Organic Promise",
        cartTotal: "Cart total",
        cartSummary: (weight, count) => `${weight} kg across ${count} varieties`,
        perkUnlock: (remainingWeightKg, title) => `Add ${remainingWeightKg} more kg to unlock ${title}.`,
        perkUnlocked: "Your box has already unlocked every premium cart perk.",
        perkDescriptionFallback:
          "Premium packaging, priority dispatch, and gift-ready presentation are already active for this order."
      },
      highlights: {
        qualityTitle: "Quality Guarantee",
        qualityBody:
          "We stand by the quality of our fruit. Every mango is carefully inspected and packaged to ensure it arrives in pristine condition.",
        unboxingTitle: "Premium unboxing",
        unboxingBody:
          "Unlock premium packaging, priority dispatch, and complimentary gift wrapping as you build your perfect box.",
        deliveryTitle: "Delivery status",
        deliveryReady: (location, pincode) => `Delivering to ${location} (${pincode}).`,
        deliveryPending:
          "Check your pincode in the header whenever you are ready. We only need it before checkout."
      },
      loading: "Harvesting today's mango selection...",
      addedToast: (weight, name) => `${weight} kg of ${name} added to your box.`,
      stickySelected: (weight) => `${weight} kg selected`,
      stickyUnlock: (remainingWeightKg, title) => `Add ${remainingWeightKg} more kg to unlock ${title}.`,
      stickyUnlocked: "Your premium box perks are all unlocked.",
      reviewCart: "Review cart"
    },
    login: {
      metaTitle: "Sign In",
      metaDescription:
        "Sign in to complete your purchase, manage delivery details, and review your order history.",
      signInRedirecting: "Redirecting to sign in...",
      signInSuccess: "Signed in successfully.",
      signInError: "Unable to sign in.",
      heroEyebrow: "MANGOMAGIC",
      heroTitle: "Mango ordering that feels as premium as the fruit.",
      heroSubtitle:
        "Experience a seamless way to order the finest mangoes. Track your deliveries and manage your premium fruit boxes.",
      heroFeatures: ["Saved delivery profile", "Quick repeat purchases", "Order history in one place"],
      cardEyebrow: "Welcome",
      cardTitle: "Sign in for checkout",
      cardBanner:
        "Sign in to complete your purchase, track your farm-fresh deliveries, and view your exclusive order history.",
      signingIn: "Signing you in...",
      continueWithGoogle: "Continue with Google",
      secureNote: "Secure, instant sign-in with your Google account.",
      browseGuest: "Continue browsing as guest"
    },
    checkout: {
      metaTitle: "Checkout",
      metaDescription: "Enter delivery details, review your mango order, and complete secure payment.",
      pageEyebrow: "Checkout",
      pageTitle: "Confirm delivery and pay securely",
      pageSubtitle: "Enter your delivery details and securely complete your purchase to reserve your harvest.",
      validation: {
        fullName: "Please add the recipient name.",
        address: "Please add the delivery address.",
        phone: "Enter a valid 10-digit Indian mobile number or include the +91 country code.",
        pincode: "Please enter a valid 6-digit pincode.",
        serviceablePincode: "Please choose a serviceable pincode before continuing.",
        saveBeforePayment: "Please save your delivery details before payment."
      },
      saveSuccess: "Delivery details saved for checkout.",
      createOrderError: "Unable to create payment order.",
      razorpayLoadError: "Unable to load Razorpay checkout.",
      razorpayDescription: "Fresh Mango Order",
      verifyError: "Payment verification failed.",
      paymentCancelled: "Payment was cancelled.",
      paymentVerified: "Payment verified. Order confirmed.",
      paymentFailed: "Payment failed. No order was created.",
      summaryTitle: "Order summary",
      perkUnlock: (remainingWeightKg, title) => `Add ${remainingWeightKg} more kg to unlock ${title}.`,
      perkUnlocked: "Your cart has already unlocked every premium handling perk.",
      perkDescriptionFallback: "Packaging and dispatch perks are already active for this order.",
      deliveryTitle: "Delivery address",
      edit: "Edit",
      deliveryConfirmed: (location) => `Delivery confirmed for ${location}.`,
      savedPincode: (pincode) => `Using saved pincode ${pincode}.`,
      updatePincodeHint: "You can update your pincode from the form below.",
      fields: {
        fullName: "Full name",
        address: "Delivery address",
        phone: "10-digit mobile number or +91XXXXXXXXXX",
        pincode: "Pincode"
      },
      pincodeChecking: "Checking pincode...",
      pincodeDelivering: (location) => `Delivering to ${location}`,
      pincodeUnavailable: "This pincode is not serviceable yet.",
      pincodePending: "We will confirm delivery as soon as the pincode is complete.",
      saveButton: "Save delivery details",
      totalPayable: "Total payable",
      totalWeight: (weight) => `${weight} kg selected for this order.`,
      pay: (amount) => `Pay ${amount}`,
      preparingPayment: (amount) => `Preparing payment for ${amount}`,
      saveToContinue: "Save delivery details to continue",
      labels: {
        mobile: "Mobile",
        pincode: "Pincode"
      }
    },
    contact: {
      metaTitle: "Contact",
      metaDescription:
        "Reach MangoMagic, view business hours, and see the local delivery pincodes currently supported.",
      heroEyebrow: "Contact",
      heroBody: "Fresh mango boxes, local support, and a smooth buying experience from orchard to doorstep.",
      reachUs: "Reach us",
      whatsapp: "WhatsApp us",
      businessHours: "Business hours",
      location: "Location",
      locationNote:
        "Need help with delivery coverage or gifting requests? Reach us on WhatsApp and we will help you quickly.",
      deliveryArea: "Delivery area",
      deliveryNote: "Orders placed before 12 PM are packed first and usually delivered within 2 business days.",
      minimumOrderNote: "Flexible boxes from 1 kg onwards"
    },
    orders: {
      metaTitle: "Orders",
      metaDescription: "Review your confirmed mango orders, totals, and delivery progress in one place.",
      loadError: "Unable to load your orders.",
      loading: "Loading your mango orders...",
      emptyTitle: "No orders yet",
      emptyBody: "Your confirmed mango orders will appear here with status updates as they move through delivery.",
      pageEyebrow: "Orders",
      pageTitle: "Your order history",
      orderLabel: (id) => `Order #${id}`,
      itemSummary: (name, weightKg, quantity) =>
        quantity ? `${name} ${weightKg} kg x ${quantity}` : `${name} ${weightKg} kg`,
      itemWeight: (weightKg, quantity) => (quantity ? `${weightKg} kg x ${quantity}` : `${weightKg} kg`)
    },
    orderConfirm: {
      metaTitle: "Order Confirmed",
      metaDescription: "Your MangoMagic order is confirmed and your payment has been verified successfully.",
      loadError: "Unable to load order details.",
      loading: "Pulling your fresh order details...",
      title: "Order Confirmed!",
      orderId: (id) => `Order ID: ${id}`,
      estimatedDelivery: "Estimated delivery: 2-3 business days",
      viewOrders: "View All Orders",
      orderMore: "Order More Mangoes",
      itemSummary: (weightKg, quantity) => (quantity ? `${weightKg} kg x ${quantity}` : `${weightKg} kg`)
    },
    otp: {
      pageEyebrow: "Authentication updated",
      pageTitle: "OTP login has been replaced",
      pageBody: "Please continue with Google sign-in on the login page."
    },
    pincode: {
      metaTitle: "Delivery Pincode",
      metaDescription: "Confirm whether MangoMagic delivers to your area and save the pincode to your profile.",
      pageEyebrow: "Delivery check",
      pageTitle: "Do we deliver to you?",
      pageBody: "Enter your 6-digit pincode. We will instantly confirm whether MangoMagic can deliver there.",
      checking: "Checking delivery availability...",
      checkError: "Could not verify the pincode.",
      confirmed: "Delivery pincode confirmed.",
      successTitle: (areaName, city) => `Great! We deliver to ${areaName}, ${city}.`,
      successButton: "Great! We deliver here.",
      unavailableTitle: "Sorry, we do not deliver to this pincode yet.",
      availablePincodes: "Available delivery pincodes:"
    },
    cart: {
      saveSuccess: "Delivery details saved.",
      emptyTitle: "Your cart is still empty",
      emptyBody: "Pick a variety, choose a weight, and start building your mango order.",
      browse: "Browse mangoes",
      pageEyebrow: "Cart",
      pageTitle: "Review your selected kilograms",
      deliveryTitle: "Delivery details",
      editAddress: "Edit address",
      fields: {
        fullName: "Full name",
        address: "Delivery address",
        pincode: "Pincode"
      },
      saveButton: "Save delivery details",
      orderTotal: "Order total",
      totalWeight: (weight) => `${weight} kg selected across your mango varieties.`,
      proceedToPay: "Proceed to Pay",
      labels: {
        pincode: "Pincode"
      }
    }
  },
  status: {
    paid: "Paid",
    dispatched: "Dispatched",
    delivered: "Delivered",
    cancelled: "Cancelled",
    pending: "Pending"
  }
};
