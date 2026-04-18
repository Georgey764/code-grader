import math


def is_prime(n):
    if n < 2:
        return False
    for i in range(2, int(math.sqrt(n)) + 1):
        if n % i == 0:
            return False
    return True


def primes_up_to(limit):
    result = []
    for n in range(2, limit + 1):
        if is_prime(n):
            result.append(n)
    return result


print(primes_up_to(50))
