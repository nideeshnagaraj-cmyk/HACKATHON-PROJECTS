height=[1,8,6,2,5,4,8,3,7]
left, right = 0, len(height) - 1
Max = 0
while left < right:
    d = right - left
    m = min(height[left], height[right])
    Max = max(Max, m * d)
    if height[left] < height[right]:
        left += 1
    else:
        right -= 1
print(Max)