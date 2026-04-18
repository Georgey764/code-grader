def calculate_average(numbers):
    total = 0
    for num in numbers:
        total += num
    return total / len(numbers)


def find_max(numbers):
    maximum = numbers[0]
    for num in numbers:
        if num > maximum:
            maximum = num
    return maximum


data = [4, 7, 2, 9, 1, 5]
print("Average:", calculate_average(data))
print("Maximum:", find_max(data))
