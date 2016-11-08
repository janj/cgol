class String
  def bg_magenta;     "\e[45m#{self}\e[0m" end
  def bg_gray;        "\e[47m#{self}\e[0m" end
  def bg_cyan;        "\e[46m#{self}\e[0m" end
  def blue;           "\e[34m#{self}\e[0m" end
end

class Conway
  attr_accessor :size, :seen_map, :step_count
  attr_reader :conway_board

  def initialize(board: nil, size: 25)
    @conway_board = ConwayBoard.new(board: board, size: size)
    @seen_map = {}
  end

  def run
    self.seen_map = {}
    self.step_count = 0
    current_board_seen_after_steps = nil
    repeating = false
    while current_board_seen_after_steps.nil?
      last_board = conway_board.board
      step_with_print
      self.step_count += 1
      current_board_seen_after_steps = mark_steps_or_return_last_seen
    end
    loop_length = step_count - current_board_seen_after_steps - 1
    (loop_length * 3).times do
      step_with_print
    end
    puts "At stable state after #{step_count} steps"
    puts "In loop of length #{loop_length}"
  end

  def step_with_print
    ConwayPrinter.new(conway_board: conway_board, step_count: step_count).print_board
    conway_board.step
    sleep(0.25)
  end

  def mark_steps_or_return_last_seen
    if steps_for_current_board
      steps_for_current_board
    else
      store_step_count_for_current_board(step_count)
      nil
    end
  end

  def steps_for_current_board
    seen_map[to_key(conway_board.board)]
  end

  def store_step_count_for_current_board(step_count)
    seen_map[to_key(conway_board.board)] = step_count
  end

  def to_key(board)
    board.map do |col|
      col.join('')
    end.join('')
  end
end

class ConwayPrinter
  attr_reader :board, :step_count

  def initialize(conway_board:, step_count: 0)
    @board = conway_board.board
    @step_count = step_count
  end

  def print_board
    step_s = step_count > 0 ? step_count.to_s : ''
    cell_size = 2
    cell = ' ' * cell_size
    border_cell = ' '.bg_cyan
    length_with_border = board.size * cell_size + 2 * cell_size
    print border_cell * (length_with_border - step_s.length)
    puts step_s.blue.bg_cyan
    board.each do |col|
      print border_cell * cell_size
      col.each { |c| print c == 1 ? cell.bg_magenta : cell.bg_gray}
      print border_cell * cell_size
      puts
    end
    puts border_cell * length_with_border
  end
end

class ConwayBoard
  attr_accessor :board, :size

  def initialize(board: nil, size: 25)
    @board = board || random(size)
    @size = @board.size
  end

  def neighbors(col_idx, row_idx)
    left = (col_idx - 1) % size
    right = (col_idx + 1) % size
    top = (row_idx - 1) % size
    bottom = (row_idx + 1) % size
    [
      [left, top],
      [left, row_idx],
      [left, bottom],

      [col_idx, top],
      [col_idx, bottom],

      [right, top],
      [right, row_idx],
      [right, bottom],      
    ]
  end

  def step
    self.board = (0..(size-1)).map do |col_idx|
      (0..(size-1)).map do |row_idx|
        alive_or_dead(col_idx, row_idx)
      end
    end
  end

  def neighbor_count(col_idx, row_idx)
    neighbors(col_idx, row_idx).map do |col_idx, row_idx|
      board[col_idx][row_idx] 
    end.reduce(:+)
  end

  def alive_or_dead(col_idx, row_idx)
    case neighbor_count(col_idx, row_idx)
    when 2
      board[col_idx][row_idx]
    when 3
      1
    else
      0
    end
  end

  def random(size)
    (0..(size-1)).map { |col_idx| (0..(size-1)).map { |row_idx| rand(2) }}
  end
end

class ConwayTest
  def self.run_all
    test_methods.each do |test|
      test_single(test)
    end
  end

  def self.run(*tests)
    tests.each do |test|
      test_single("#{test}_test")
    end
  end

  def self.test_single(test)
    puts test
    TestHelper.print_errors(ConwayTest.send(test))
    puts
  end

  def self.test_methods
    (methods - superclass.methods).select { |method_name| method_name.to_s.end_with?('_test') }
  end

  def self.mark_steps_or_return_last_seen_test
    c = Conway.new(board: [[0, 1], [1, 1]])
    c.step_count = 42
    returns_nil_when_new_board = c.mark_steps_or_return_last_seen.nil?
    is_stored = !c.steps_for_current_board.nil?
    is_stored_with_correct_value = c.steps_for_current_board == 42
    returns_steps_when_seen = c.mark_steps_or_return_last_seen == 42

    [].tap do |errors|
      errors << "should return nil for unrecognized board" unless returns_nil_when_new_board
      errors << "should store the board" unless is_stored
      errors << "should store the number of steps with the board, expected #{42} got #{c.steps_for_board}" unless is_stored_with_correct_value
      errors << "should return the number of steps to board when stored" unless returns_steps_when_seen
    end
  end
end

class ConwayBoardTest
  def self.run_all
    test_methods.each do |test|
      test_single(test)
    end
  end

  def self.run(*tests)
    tests.each do |test|
      test_single("#{test}_test")
    end
  end

  def self.test_single(test)
    puts test
    TestHelper.print_errors(ConwayBoardTest.send(test))
    puts
  end

  def self.test_methods
    (methods - superclass.methods).select { |method_name| method_name.to_s.end_with?('_test') }
  end

  def self.stub_neigbor_count(conway_board, count)
    conway_board.define_singleton_method(:neighbor_count) { |*args| count }
  end

  def self.alive_or_dead_test
    c = ConwayBoard.new(board: [[1, 0], [0, 0]])
    stub_neigbor_count(c, 2)
    alive_identity = c.alive_or_dead(0, 0) == 1
    dead_identity = c.alive_or_dead(0, 1) == 0

    stub_neigbor_count(c, 3)
    alive_group = c.alive_or_dead(0, 0) == 1
    dead_group = c.alive_or_dead(1, 0) == 1

    stub_neigbor_count(c, 1)
    alive_starved = c.alive_or_dead(0, 0) == 0
    dead_starved = c.alive_or_dead(0, 1) == 0

    stub_neigbor_count(c, 5)
    alive_crowded = c.alive_or_dead(0, 0) == 0
    dead_crowded = c.alive_or_dead(0, 1) == 0

    [].tap do |errors|
      errors << "should return 1 when alive and surrounded by two neighbors" unless alive_identity
      errors << "should return 0 when dead and surrounded by two neighbors" unless dead_identity
      errors << "should return 1 when alive and surrounded by three neighbors" unless alive_group
      errors << "should return 1 when dead and surrounded by three neighbors" unless dead_group
      errors << "should return 0 when alive and starved" unless alive_starved
      errors << "should return 0 when dead and starved" unless dead_starved
      errors << "should return 0 when alive and crowded" unless alive_crowded
      errors << "should return 0 when dead and crowded" unless dead_crowded
    end
  end

  def self.neighbor_count_test
    c = ConwayBoard.new(board: [[1, 0, 0], [0, 1, 1], [1, 1, 0]])
    top_left_count = c.neighbor_count(0, 0)
    expected_top_left = 4
    middle_count = c.neighbor_count(1, 1)
    expected_middle = 4
    bottom_right_count = c.neighbor_count(2, 2)
    expected_bottom_right = 5
    [].tap do |errors|
      errors << "top left count expected #{expected_top_left} got #{top_left_count}" unless top_left_count == expected_top_left
      errors << "middle count expected #{expected_middle} got #{middle_count}" unless middle_count == expected_middle
      errors << "bottom right count expected #{expected_bottom_right} got #{bottom_right_count}" unless bottom_right_count == expected_bottom_right
    end
  end

  def self.neighbors_test
    c = ConwayBoard.new(size: 5)
    top_left_neighbors = c.neighbors(0, 0).sort
    expected_top_left = [[0, 1], [0, 4], [1, 0], [1, 1], [1, 4], [4, 0], [4, 1], [4, 4]]
    bottom_right_neighbors = c.neighbors(4, 4).sort
    expected_bottom_right = [[0, 0], [0, 3], [0, 4], [3, 0], [3, 3], [3, 4], [4, 0], [4, 3]]
    middle_neighbors = c.neighbors(2, 2).sort
    expected_middle = [[1, 1], [1, 2], [1, 3], [2, 1], [2, 3], [3, 1], [3, 2], [3, 3]]
    [].tap do |errors|
      errors << "top left expected #{expected_top_left} got #{top_left_neighbors}" unless top_left_neighbors == expected_top_left
      errors << "bottom right expected #{expected_bottom_right} got #{bottom_right_neighbors}" unless bottom_right_neighbors == expected_bottom_right
      errors << "middle expected #{expected_middle} got #{middle_neighbors}" unless middle_neighbors == expected_middle
    end
  end
end


class TestHelper
  def self.print_errors(errors)
    if errors.length == 0
      puts 'PASSED'
    else
      errors.each do |error|
        puts " - failed for #{error}"
      end
    end
  end
end
