# Advanced Movement - FAQ

## Q1: Should wall jump require holding toward wall?
**A**: Optional. Holding toward wall feels more realistic, but auto wall jump is more accessible.

## Q2: Can I dash in mid-air?
**A**: Yes! Limit to one air dash, reset on landing.

## Q3: Should dash cancel gravity?
**A**: Yes for full control, no for momentum-based feel.

## Q4: How do I prevent infinite wall jumps?
**A**: Add wall jump cooldown or require touching ground between wall jumps.

## Q5: Should ground pound break blocks?
**A**: Great for gameplay! Check tiles below player on landing.

## Q6: Can I dash during ground pound?
**A**: Design choice. Cancelling is more flexible, no cancel is more committed.

## Q7: How do I tune dash length?
**A**: Adjust DASH_SPEED × DASH_DURATION. 500px/s × 0.2s = 100px travel.

## Q8: Should ledge grab be automatic?
**A**: Auto grab is accessible, button prompt is skilled.

## Q9: Can I chain dashes?
**A**: Only with cooldown. Infinite dash breaks level design.

## Q10: How do I make wall jump feel good?
**A**: High horizontal push + good wall slide speed. Test extensively!
