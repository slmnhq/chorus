class ChorusWorker < QC::Worker
  def handle_signals
    %W(INT TERM).each do |sig|
      trap(sig) do
        raise Interrupt
      end
    end
  end
end