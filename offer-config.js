/* FOUNDING-CLIENT OFFER SETTINGS
   limit    = how many places exist (3)
   approved = how many clients you have approved so far

   When you approve a client, change "approved" to 1, then 2, then 3, and upload this one file again.
   When approved reaches the limit, the offer closes by itself:
   - the gold offer banner disappears from the homepage form
   - offer.html shows "closed" and its form stops working
   After that you can safely delete offer.html if you want it gone completely. */
window.TRTL_OFFER = { limit: 3, approved: 0 };
