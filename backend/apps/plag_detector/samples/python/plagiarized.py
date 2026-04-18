# Slightly modified version of original.py
def compute_mean(vals):
    s = 0
    for v in vals:
        s += v
    return s / len(vals)


def get_maximum(lst):
    mx = lst[0]
    for v in lst:
        if v > mx:
            mx = v
    return mx


my_list = [4, 7, 2, 9, 1, 5]
print("Mean:", compute_mean(my_list))
print("Max:", get_maximum(my_list))
