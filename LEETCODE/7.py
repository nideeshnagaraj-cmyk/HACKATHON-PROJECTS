x=-123
sign=-1 if x<0 else 1
x=abs(x)
y=str(x)[::-1]
r=int(y) if (-2**31<=int(y)<=2**31-1) else 0
print(r*sign)