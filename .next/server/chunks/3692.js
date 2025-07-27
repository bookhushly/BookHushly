"use strict";exports.id=3692,exports.ids=[3692],exports.modules={84827:(e,r,t)=>{t.d(r,{T:()=>i});var n=t(60080),a=t(23161);function i({className:e,...r}){return n.jsx("div",{className:(0,a.cn)("inline-block animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] text-primary motion-reduce:animate-[spin_1.5s_linear_infinite]",e),role:"status",...r,children:n.jsx("span",{className:"sr-only",children:"Loading..."})})}},95440:(e,r,t)=>{t.d(r,{AW:()=>b,Km:()=>i,LR:()=>c,N:()=>o,TB:()=>d,X8:()=>l,Y9:()=>g,_B:()=>w,aL:()=>m,aV:()=>y,e6:()=>u,i1:()=>_,jy:()=>s,kP:()=>p,lx:()=>f,pz:()=>h,xv:()=>a});var n=t(46757);let a=async e=>{try{let{data:r,error:t}=await n.O.from("users").upsert({id:e.id,email:e.email,name:e.name,role:e.role,created_at:e.created_at||new Date().toISOString(),updated_at:new Date().toISOString()}).select().maybeSingle();if(t)throw t;return{data:r,error:null}}catch(e){return console.error("Create user profile error:",e),{data:null,error:e}}},i=async e=>{try{let r=await n.O.auth.getSession(),t=r.data?.session?.access_token;console.log("\uD83D\uDD10 Access token used:",t);let{data:a,error:i}=await n.O.from("vendors").insert({user_id:e.user_id,business_name:e.business_name,business_description:e.business_description,business_address:e.business_address,phone_number:e.phone_number,business_registration_number:e.business_registration_number,tax_identification_number:e.tax_identification_number,bank_account_name:e.bank_account_name,bank_account_number:e.bank_account_number,bank_name:e.bank_name,business_category:e.business_category,years_in_operation:e.years_in_operation,website_url:e.website_url,approved:!1,status:"reviewing",created_at:new Date().toISOString(),updated_at:new Date().toISOString()}).select().maybeSingle();if(i)throw i;try{let r=await fetch("/api/send",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({to:"aboderindaniel482@gmail.com",templateName:"kycSubmissionNotice",data:{vendorName:e.business_name,phone:e.phone_number,businessName:e.business_name,dashboardUrl:"http://www.bookhushly.com/dashboard/admin/kyc"}})}),t=await r.json();r.ok&&t.success||console.warn("Failed to send KYC submission email:",t.error)}catch(e){console.error("Email dispatch error:",e)}return{data:a,error:null}}catch(e){return console.error("Create vendor profile error:",e),{data:null,error:e}}},s=async e=>{try{let{data:r,error:t}=await n.O.from("vendors").select(`
        *,
        users (
          name,
          email
        )
      `).eq("user_id",e).maybeSingle();if(t)throw t;return{data:r,error:null}}catch(e){return console.error("Get vendor profile error:",e),{data:null,error:e}}},o=async(e,r)=>{try{let{data:t,error:a}=await n.O.from("vendors").update(r).eq("id",e).select().single();if(a)throw a;return{data:t,error:null}}catch(e){return{data:null,error:e}}},l=async e=>{try{let{data:r,error:t}=await n.O.from("vendors").select("id").eq("user_id",e.vendor_id).single();if(t)throw t;let{data:a,error:i}=await n.O.from("listings").insert({vendor_id:r.id,title:e.title,description:e.description,category:e.category,price:e.price,location:e.location,capacity:e.capacity,duration:e.duration,availability:e.availability,features:e.features,requirements:e.requirements,cancellation_policy:e.cancellation_policy,media_urls:e.media_urls||[],active:!1!==e.active,created_at:new Date().toISOString(),updated_at:new Date().toISOString()}).select().single();if(i)throw i;return{data:a,error:null}}catch(e){return console.error("Create listing error:",e),{data:null,error:e}}},c=async e=>{try{let{data:r,error:t}=await n.O.from("listings").select(`
        *,
        vendors (
          business_name,
          approved,
          users (
            name,
            email
          )
        )
      `).eq("id",e).single();if(t)throw t;return{data:r,error:null}}catch(e){return{data:null,error:e}}},u=async(e,r)=>{try{let{data:t,error:a}=await n.O.from("listings").update(r).eq("id",e).select(`
        *,
        vendors (
          business_name,
          approved,
          users (
            name,
            email
          )
        )
      `).single();if(a)throw a;return{data:t,error:null}}catch(e){return console.error("Update listing error:",e),{data:null,error:e}}},d=async e=>{try{let{data:r,error:t}=await n.O.from("bookings").insert({listing_id:e.listing_id,customer_id:e.customer_id,booking_date:e.booking_date,booking_time:e.booking_time,guests:e.guests,duration:e.duration,special_requests:e.special_requests,contact_phone:e.contact_phone,contact_email:e.contact_email,total_amount:e.total_amount,status:"pending",payment_status:"pending",payment_reference:e.payment_reference||null,created_at:new Date().toISOString(),updated_at:new Date().toISOString()}).select().single();if(t)throw t;return{data:r,error:null}}catch(e){return console.error("Create booking error:",e),{data:null,error:e}}},m=async(e,r)=>{try{if("customer"===r){let{data:r,error:t}=await n.O.from("bookings").select(`
          *,
          listings (
            title,
            category,
            price,
            vendors (
              business_name,
              users (
                name,
                email
              )
            )
          )
        `).eq("customer_id",e).order("created_at",{ascending:!1});if(t)throw t;return{data:r,error:null}}if("vendor"===r){let{data:r}=await n.O.from("vendors").select("id").eq("user_id",e).single();if(!r)return{data:[],error:null};let{data:t,error:a}=await n.O.from("bookings").select(`
          *,
          listings (
            title,
            category,
            price,
            vendors (
              business_name,
              users (
                name,
                email
              )
            )
          )
        `).eq("listings.vendor_id",r.id).order("created_at",{ascending:!1});if(a)throw a;return{data:t,error:null}}return{data:[],error:null}}catch(e){return console.error("Get bookings error:",e),{data:null,error:e}}},_=async(e,r)=>{try{let{data:t,error:a}=await n.O.from("bookings").update({status:r}).eq("id",e).select().single();if(a)throw a;return{data:t,error:null}}catch(e){return{data:null,error:e}}},g=async()=>{try{let{data:e,error:r}=await n.O.rpc("get_admin_stats");if(r)throw r;return{data:e,error:null}}catch(e){return console.error("Get admin stats error:",e),{data:{totalUsers:0,totalVendors:0,totalBookings:0,totalRevenue:0,pendingApprovals:0,activeListings:0,monthlyGrowth:0,conversionRate:0},error:null}}},p=async()=>{try{let{data:e,error:r}=await n.O.from("vendors").select(`
        *,
        users (
          name,
          email
        )
      `).eq("approved",!1).order("created_at",{ascending:!1});if(r)throw r;return{data:e,error:null}}catch(e){return console.error("Get pending vendors error:",e),{data:null,error:e}}},y=async(e,r)=>{try{let{data:t,error:a}=await n.O.from("vendors").update({approved:r,status:"approved",approved_at:r?new Date().toISOString():null,updated_at:new Date().toISOString()}).eq("id",e).select().single();if(a)throw a;return{data:t,error:null}}catch(e){return console.error("Approve vendor error:",e),{data:null,error:e}}},b=async(e={})=>{try{let r=n.O.from("users").select("*").order("created_at",{ascending:!1});e.limit&&(r=r.limit(e.limit));let{data:t,error:a}=await r;if(a)throw a;return{data:t,error:null}}catch(e){return{data:null,error:e}}},w=async(e={})=>{try{let r=n.O.from("bookings").select(`
        *,
        listings (
          title,
          category,
          vendors (
            business_name
          )
        )
      `).order("created_at",{ascending:!1});e.limit&&(r=r.limit(e.limit));let{data:t,error:a}=await r;if(a)throw a;return{data:t,error:null}}catch(e){return{data:null,error:e}}},f=async e=>{try{let{data:r,error:t}=await n.O.from("bookings").select(`
        *,
        listings (
          title,
          category,
          price,
          vendors (
            business_name,
            users (
              name,
              email
            )
          )
        )
      `).eq("id",e).single();if(console.error("Booking data:",r),t)throw t;return{data:r,error:null}}catch(e){return{data:null,error:e}}},h=async(e,r,t=null)=>{try{let a={payment_status:r,updated_at:new Date().toISOString()};t&&(a.payment_reference=t),"completed"===r&&(a.status="confirmed");let{data:i,error:s}=await n.O.from("bookings").update(a).eq("id",e).select().single();if(s)throw s;return{data:i,error:null}}catch(e){return{data:null,error:e}}}}};