# Creating a new 2x4 array with random floats
array = rand(Float64, (2, 4))

# Shows the numbers of generated array
println("Das zufällige Array besitzt die folgenden Zahlen: ")
println(array)

# Setting the first element as a reference
reference = first(array)

# Compares the reference with all elements of the given array
# Sets i as the new reference if it is bigger than the reference
for i in array
    if reference < i
        reference = i
    end
end

# Output with the result
println("Die größte Zahl des Arrays ist " * "$reference")